import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    List notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { read, limit = 40 } = req.query;
  const query = {};
  if (read === 'true') query.read = true;
  if (read === 'false') query.read = false;

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(Number(limit));
  const unread = await Notification.countDocuments({ read: false });
  res.json({ success: true, unread, notifications });
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json({ success: true, notification });
});

// @desc    Mark one as read / unread
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const toggleRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  notification.read = req.body.read ?? !notification.read;
  await notification.save();
  res.json({ success: true, notification });
});

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification removed' });
});
