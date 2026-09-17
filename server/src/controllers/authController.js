import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { generateToken, sanitizeUser } from '../utils/generateToken.js';

const buildAuthResponse = (user) => ({
  success: true,
  token: generateToken(user._id, user.role),
  user: sanitizeUser(user),
});

// @desc    Register a new investor / entrepreneur / admin
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    gender,
    phone,
    organization,
    location,
    focusArea,
    bio,
    role = 'investor',
  } = req.body;

  if (!fullName || !email) {
    res.status(400);
    throw new Error('Full name and email are required');
  }

  // The password used to default to '1234' when the form did not send one,
  // which meant nobody could sign in with the password they thought they
  // had chosen. It is now required.
  if (!password || String(password).length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Gender decides the default profile photo, so it must be one of the two
  // known values rather than whatever the client happened to send.
  const normalisedGender = String(gender || '').trim().toLowerCase();
  if (!['male', 'female'].includes(normalisedGender)) {
    res.status(400);
    throw new Error('Please select a gender (male or female)');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    gender: normalisedGender,
    phone,
    organization,
    location,
    focusArea,
    bio,
    role: ['admin', 'investor', 'entrepreneur'].includes(role) ? role : 'investor',
    status: role === 'admin' ? 'active' : 'pending',
  });

  await Activity.create({
    user: user._id,
    userName: user.fullName,
    userEmail: user.email,
    activity: `New ${user.role} registered`,
    module: 'Accounts',
    status: 'Success',
    description: `${user.fullName} created a ${user.role} account.`,
  });

  res.status(201).json(buildAuthResponse(user));
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

  // A user document saved without a password (older seed data) would make
  // bcrypt.compare throw, surfacing as a 500 with no useful message.
  if (!user || !user.password || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.online = true;
  await user.save({ validateBeforeSave: false });

  res.json(buildAuthResponse(user));
});

// @desc    Current profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @desc    Update profile / settings
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const fields = [
    'fullName', 'phone', 'organization', 'location', 'focusArea', 'bio', 'avatar',
    'gender', 'nid', 'tin', 'taxCountry', 'residentialAddress', 'notificationPrefs',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  const updated = await req.user.save();
  res.json({ success: true, user: sanitizeUser(updated) });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.online = false;
    await req.user.save({ validateBeforeSave: false });
  }
  res.json({ success: true, message: 'Logged out' });
});
