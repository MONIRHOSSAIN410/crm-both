import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { sanitizeUser } from '../utils/generateToken.js';

// @desc    List users (filter by role / status / search)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, limit = 50, page = 1 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ success: true, count: users.length, total, page: Number(page), users });
});

// @desc    Stats for investor / entrepreneur pages
// @route   GET /api/users/stats?role=investor
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const role = req.query.role || 'investor';
  const [total, active, pending, accepted, rejected] = await Promise.all([
    User.countDocuments({ role }),
    User.countDocuments({ role, status: { $in: ['active', 'live'] } }),
    User.countDocuments({ role, status: 'pending' }),
    User.countDocuments({ role, status: 'accepted' }),
    User.countDocuments({ role, status: 'rejected' }),
  ]);

  const topInvestors = await User.find({ role: 'investor' })
    .sort({ totalInvested: -1 })
    .limit(4)
    .select('fullName avatar totalInvested');

  res.json({
    success: true,
    stats: { total, active, pending, accepted, rejected },
    topInvestors,
  });
});

// @desc    Single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update a user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Review an application (accept / reject / live)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const reviewUser = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'accepted', 'rejected', 'live', 'active'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const previous = user.status;
  user.status = status;
  if (status === 'accepted' || status === 'live') user.verified = true;
  await user.save();

  await Activity.create({
    user: req.user?._id,
    userName: req.user?.fullName || 'Admin',
    userEmail: req.user?.email,
    activity: `Application ${status}`,
    module: 'Accounts',
    status: 'Success',
    isAdminAction: true,
    description: `${user.fullName}'s application moved from ${previous} to ${status}.`,
  });

  res.json({ success: true, user });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: 'User removed' });
});
