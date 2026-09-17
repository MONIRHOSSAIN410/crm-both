import asyncHandler from 'express-async-handler';
import Activity from '../models/Activity.js';

// @desc    Activity logs with filters
// @route   GET /api/activities
// @access  Private/Admin
export const getActivities = asyncHandler(async (req, res) => {
  const { search, module, status, user, from, to, limit = 60, page = 1 } = req.query;
  const query = {};
  if (module) query.module = module;
  if (status) query.status = status;
  if (user) query.userName = { $regex: user, $options: 'i' };
  if (search) {
    query.$or = [
      { activity: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [activities, total] = await Promise.all([
    Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Activity.countDocuments(query),
  ]);

  res.json({ success: true, count: activities.length, total, activities });
});

// @desc    Activity log stat cards
// @route   GET /api/activities/stats
// @access  Private/Admin
export const getActivityStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, today, adminActions, canceled] = await Promise.all([
    Activity.countDocuments(),
    Activity.countDocuments({ createdAt: { $gte: startOfDay } }),
    Activity.countDocuments({ isAdminAction: true }),
    Activity.countDocuments({ status: 'Failed' }),
  ]);

  res.json({ success: true, stats: { total, today, adminActions, canceled } });
});

// @desc    One activity with details
// @route   GET /api/activities/:id
// @access  Private/Admin
export const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  res.json({ success: true, activity });
});

// @desc    Add a comment to an activity
// @route   POST /api/activities/:id/comments
// @access  Private/Admin
export const addActivityComment = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }
  activity.comments.push({ author: req.user.fullName, text: req.body.text });
  await activity.save();
  res.status(201).json({ success: true, activity });
});

// @desc    Export logs as CSV
// @route   GET /api/activities/export
// @access  Private/Admin
export const exportActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(1000);
  const header = 'User,Email,Activity,Module,Date,Status\n';
  const rows = activities
    .map((a) =>
      [a.userName, a.userEmail, a.activity, a.module, a.createdAt.toISOString(), a.status]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="muldhon-activity-logs.csv"');
  res.send(header + rows);
});
