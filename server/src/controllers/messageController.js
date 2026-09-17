import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Contact list for the chat sidebar
// @route   GET /api/messages/contacts?role=entrepreneur
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = { role: { $ne: 'admin' } };
  if (role) query.role = role;
  if (search) query.fullName = { $regex: search, $options: 'i' };

  const users = await User.find(query).select('fullName avatar role online').limit(40);

  const contacts = await Promise.all(
    users.map(async (u) => {
      const last = await Message.findOne({ conversation: String(u._id) }).sort({ createdAt: -1 });
      const unread = await Message.countDocuments({
        conversation: String(u._id),
        fromAdmin: false,
        read: false,
      });
      return {
        _id: u._id,
        fullName: u.fullName,
        avatar: u.avatar,
        role: u.role,
        online: u.online,
        lastMessage: last?.text || '',
        lastAt: last?.createdAt || null,
        unread,
      };
    })
  );

  contacts.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  res.json({ success: true, contacts });
});

// @desc    Thread with one user
// @route   GET /api/messages/:userId
// @access  Private
export const getThread = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversation: req.params.userId }).sort({ createdAt: 1 });
  await Message.updateMany(
    { conversation: req.params.userId, fromAdmin: false, read: false },
    { read: true }
  );
  res.json({ success: true, messages });
});

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const message = await Message.create({
    conversation: req.params.userId,
    sender: req.user._id,
    senderName: req.user.fullName,
    receiver: req.params.userId,
    text: text.trim(),
    fromAdmin: req.user.role === 'admin',
  });

  res.status(201).json({ success: true, message });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Message removed' });
});
