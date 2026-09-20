import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Activity from '../models/Activity.js';
import { sanitizeUser } from '../utils/generateToken.js';

const ROLES = ['admin', 'investor', 'entrepreneur'];
const STATUSES = ['pending', 'accepted', 'rejected', 'live', 'active'];

/** Turn a `$group` result into `{ key: count }`, with every key present. */
const tally = (rows, keys) => {
  const out = Object.fromEntries(keys.map((k) => [k, 0]));
  rows.forEach((r) => {
    if (r._id != null) out[r._id] = r.count;
  });
  return out;
};

// @desc    Everything on the platform at a glance
// @route   GET /api/super/overview
// @access  Super admin
export const getOverview = asyncHandler(async (req, res) => {
  const [
    byRole,
    byStatus,
    online,
    totalUsers,
    projectsByStatus,
    totalProjects,
    paymentsByStatus,
    paymentTotals,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    User.aggregate([{ $match: { role: { $ne: 'superadmin' } } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.aggregate([{ $match: { role: { $ne: 'superadmin' } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ online: true, role: { $ne: 'superadmin' } }),
    User.countDocuments({ role: { $ne: 'superadmin' } }),
    Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Project.countDocuments(),
    Payment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $group: { _id: null, amount: { $sum: '$amount' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
    ]),
    User.find({ role: { $ne: 'superadmin' } })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('fullName email role status avatar gender createdAt'),
    Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('activity description module status userName createdAt'),
  ]);

  const money = paymentTotals[0] || { amount: 0, commission: 0, count: 0 };

  res.json({
    success: true,
    users: {
      total: totalUsers,
      online,
      byRole: tally(byRole, ROLES),
      byStatus: tally(byStatus, STATUSES),
    },
    projects: {
      total: totalProjects,
      byStatus: tally(projectsByStatus, ['pending', 'approved', 'live', 'closed', 'rejected']),
    },
    payments: {
      total: money.amount,
      commission: money.commission,
      count: money.count,
      byStatus: paymentsByStatus.map((p) => ({ status: p._id, count: p.count, amount: p.amount })),
    },
    recentUsers,
    recentActivity,
    database: {
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    },
  });
});

// @desc    Every account, searchable and filterable
// @route   GET /api/super/users?role=&status=&search=&page=
// @access  Super admin
export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search = '', page = 1, limit = 20 } = req.query;
  const query = { role: { $ne: 'superadmin' } };
  if (ROLES.includes(role)) query.role = role;
  if (STATUSES.includes(status)) query.status = status;
  const term = String(search).trim();
  if (term) {
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { fullName: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
    ];
  }

  const size = Math.min(100, Math.max(1, Number(limit) || 20));
  const current = Math.max(1, Number(page) || 1);
  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((current - 1) * size)
      .limit(size)
      .select('fullName email phone role status verified online avatar gender createdAt totalInvested'),
    User.countDocuments(query),
  ]);

  res.json({ success: true, users, total, page: current, pages: Math.max(1, Math.ceil(total / size)) });
});

const loadTarget = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'superadmin') {
    res.status(400);
    throw new Error('The super admin account cannot be changed here');
  }
  return user;
};

// @desc    Change an account's role and / or status
// @route   PATCH /api/super/users/:id
// @access  Super admin
export const updateUserAccess = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  if (role !== undefined && !ROLES.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const user = await loadTarget(req, res);
  const before = `${user.role}/${user.status}`;
  if (role !== undefined) user.role = role;
  if (status !== undefined) {
    user.status = status;
    if (['accepted', 'live', 'active'].includes(status)) user.verified = true;
  }
  await user.save({ validateBeforeSave: false });

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    userEmail: req.user.email,
    activity: 'Account access changed',
    module: 'Accounts',
    status: 'Success',
    isAdminAction: true,
    description: `${user.fullName}: ${before} → ${user.role}/${user.status} (by super admin).`,
  });

  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Delete an account
// @route   DELETE /api/super/users/:id
// @access  Super admin
export const removeUser = asyncHandler(async (req, res) => {
  const user = await loadTarget(req, res);
  await user.deleteOne();

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    userEmail: req.user.email,
    activity: 'Account deleted',
    module: 'Accounts',
    status: 'Success',
    isAdminAction: true,
    description: `${user.fullName} (${user.email}) was deleted by the super admin.`,
  });

  res.json({ success: true, message: 'User removed' });
});
