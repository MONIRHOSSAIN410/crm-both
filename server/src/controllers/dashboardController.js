import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Activity from '../models/Activity.js';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// @desc    Admin dashboard overview
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    regInvestors,
    regEntrepreneurs,
    activeInvestors,
    pendingUsers,
    totalProjects,
    rejectedProjects,
    totalUsers,
    activeUsers,
  ] = await Promise.all([
    User.countDocuments({ role: 'investor' }),
    User.countDocuments({ role: 'entrepreneur' }),
    User.countDocuments({ role: 'investor', status: { $in: ['active', 'live', 'accepted'] } }),
    User.countDocuments({ status: 'pending' }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'rejected' }),
    User.countDocuments(),
    User.countDocuments({ online: true }),
  ]);

  const [investmentAgg] = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const statusAgg = await Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const projectStatus = { pending: 0, approved: 0, live: 0, closed: 0, rejected: 0 };
  statusAgg.forEach((s) => {
    projectStatus[s._id] = s.count;
  });

  const trendAgg = await Payment.aggregate([
    {
      $group: {
        _id: { y: { $year: '$date' }, m: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
    { $limit: 12 },
  ]);

  const recentProjects = await Project.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title budget ownerName status category');

  const recentActivity = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .select('activity description createdAt module status userName');

  res.json({
    success: true,
    cards: {
      regInvestors,
      regEntrepreneurs,
      activeInvestors,
      pending: pendingUsers,
      totalProjects,
      rejectedProjects,
      totalInvestment: investmentAgg?.total || 0,
    },
    investmentTrend: trendAgg.map((t) => ({
      label: `${monthLabels[t._id.m - 1]}`,
      value: t.total,
    })),
    projectStatus,
    systemStatus: {
      totalUsers,
      activeUsers,
      maintenanceMode: false,
      serverStatus: 'Online',
    },
    recentProjects,
    recentActivity,
  });
});

// @desc    Reports page data
// @route   GET /api/dashboard/reports
// @access  Private/Admin
export const getReports = asyncHandler(async (req, res) => {
  const [investmentAgg] = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const [activeInvestors, totalEntrepreneurs, successfulProjects, online, offline] =
    await Promise.all([
      User.countDocuments({ role: 'investor', status: { $in: ['active', 'accepted', 'live'] } }),
      User.countDocuments({ role: 'entrepreneur' }),
      Project.countDocuments({ status: 'closed' }),
      User.countDocuments({ online: true }),
      User.countDocuments({ online: false }),
    ]);

  const byCategory = await Payment.aggregate([
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'proj',
      },
    },
    { $unwind: { path: '$proj', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$proj.category', 'Other'] },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grand = byCategory.reduce((a, c) => a + c.total, 0) || 1;

  const topClients = await User.find({ role: 'investor' })
    .sort({ totalInvested: -1 })
    .limit(3)
    .select('fullName totalInvested');

  const visits = await Payment.aggregate([
    { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    cards: {
      totalInvestment: investmentAgg?.total || 0,
      activeInvestors,
      totalEntrepreneurs,
      successfulProjects,
    },
    topClients,
    activePercentage: { online, offline, total: online + offline },
    byCategory: byCategory.map((c) => ({
      category: c._id,
      total: c.total,
      percent: Math.round((c.total / grand) * 100),
    })),
    visits: visits.map((v) => ({ day: v._id, value: v.total })),
  });
});
