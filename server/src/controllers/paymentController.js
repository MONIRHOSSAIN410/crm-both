import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';

// @desc    Master escrow ledger
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = asyncHandler(async (req, res) => {
  const { status, search, limit = 100 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { dealId: { $regex: search, $options: 'i' } },
      { investorName: { $regex: search, $options: 'i' } },
      { entrepreneurName: { $regex: search, $options: 'i' } },
    ];
  }
  const payments = await Payment.find(query).sort({ date: -1 }).limit(Number(limit));
  res.json({ success: true, count: payments.length, payments });
});

// @desc    Payment summary cards + project-wise + investor-wise breakdowns
// @route   GET /api/payments/summary
// @access  Private/Admin
export const getPaymentSummary = asyncHandler(async (req, res) => {
  const [totals] = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalFunds: { $sum: '$amount' },
        commission: { $sum: '$commission' },
      },
    },
  ]);

  const [released] = await Payment.aggregate([
    { $match: { status: 'Released' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const projectWise = await Payment.aggregate([
    {
      $group: {
        _id: '$projectName',
        totalFundsRaised: { $sum: '$amount' },
        totalInvestors: { $addToSet: '$investorName' },
        lastStatus: { $last: '$status' },
      },
    },
    {
      $project: {
        projectName: '$_id',
        totalFundsRaised: 1,
        totalInvestors: { $size: '$totalInvestors' },
        currentStatus: '$lastStatus',
        _id: 0,
      },
    },
    { $sort: { totalFundsRaised: -1 } },
  ]);

  const investorWise = await Payment.aggregate([
    {
      $group: {
        _id: '$investorName',
        totalInvestedAmount: { $sum: '$amount' },
        fundedProjects: { $addToSet: '$projectName' },
        lastPaymentDate: { $max: '$date' },
      },
    },
    {
      $project: {
        investorName: '$_id',
        totalInvestedAmount: 1,
        fundedProjects: { $size: '$fundedProjects' },
        lastPaymentDate: 1,
        _id: 0,
      },
    },
    { $sort: { totalInvestedAmount: -1 } },
  ]);

  res.json({
    success: true,
    summary: {
      totalFundsInEscrow: totals?.totalFunds || 0,
      totalMilestonePayouts: released?.total || 0,
      commission: totals?.commission || 0,
    },
    projectWise,
    investorWise,
  });
});

// @desc    Monthly investment trend for charts
// @route   GET /api/payments/trend
// @access  Private/Admin
export const getPaymentTrend = asyncHandler(async (req, res) => {
  const trend = await Payment.aggregate([
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  res.json({
    success: true,
    trend: trend.map((t) => ({
      label: `${labels[t._id.month - 1]} ${t._id.year}`,
      value: t.total,
      count: t.count,
    })),
  });
});

// @desc    Create escrow record
// @route   POST /api/payments
// @access  Private/Admin
export const createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create(req.body);

  if (payment.project) {
    await Project.findByIdAndUpdate(payment.project, {
      $inc: { raised: payment.amount, totalInvestors: 1 },
    });
  }

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    activity: 'Recorded escrow payment',
    module: 'Payments',
    status: 'Success',
    isAdminAction: true,
    description: `${payment.amount} BDT recorded for deal ${payment.dealId}.`,
  });

  res.status(201).json({ success: true, payment });
});

// @desc    Release / refund escrow
// @route   PATCH /api/payments/:id/status
// @access  Private/Admin
export const setPaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['In Escrow', 'Released', 'Refunded', 'Pending', 'Failed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid payment status');
  }
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  const previous = payment.status;
  payment.status = status;
  await payment.save();

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    activity: 'Updated payment status',
    module: 'Payments',
    status: 'Success',
    isAdminAction: true,
    description: `Deal ${payment.dealId} moved from ${previous} to ${status}.`,
    changes: { paymentStatus: { from: previous, to: status } },
  });

  res.json({ success: true, payment });
});

// @desc    Delete a payment record
// @route   DELETE /api/payments/:id
// @access  Private/Admin
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  res.json({ success: true, message: 'Payment removed' });
});
