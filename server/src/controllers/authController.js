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

/**
 * Which documents the platform asks for, and what each one is called.
 *
 * Kept on the server so the list is authoritative: an upload with an unknown
 * key is rejected rather than quietly stored, and the label shown in the
 * dashboard cannot be set by whoever is uploading.
 */
export const VERIFICATION_DOCS = [
  { key: 'nid-front', label: 'National ID (front)' },
  { key: 'nid-back', label: 'National ID (back)' },
  { key: 'trade-licence', label: 'Trade licence / TIN certificate' },
];

// A data URL is ~4/3 the size of the file behind it. 3.2 MB of base64 keeps a
// three-document payload inside the 5 MB body limit set in app.js.
const MAX_DOC_DATA_URL = 3.2 * 1024 * 1024;

// @desc    The signed-in user's verification documents, files included
// @route   GET /api/auth/verification
// @access  Private
export const getVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'verificationDocs verificationStatus verificationNote verificationSubmittedAt verified'
  );

  res.json({
    success: true,
    required: VERIFICATION_DOCS,
    status: user?.verified ? 'approved' : user?.verificationStatus || 'unverified',
    note: user?.verificationNote || '',
    submittedAt: user?.verificationSubmittedAt || null,
    documents: user?.verificationDocs || [],
  });
});

// @desc    Upload / replace one verification document
// @route   PUT /api/auth/verification
// @access  Private
export const uploadVerificationDoc = asyncHandler(async (req, res) => {
  const { key, dataUrl, fileName = '', fileType = '', fileSize = 0 } = req.body;

  const known = VERIFICATION_DOCS.find((d) => d.key === key);
  if (!known) {
    res.status(400);
    throw new Error('Unknown document type');
  }
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    res.status(400);
    throw new Error('No file was received. Please choose a file and try again.');
  }
  if (dataUrl.length > MAX_DOC_DATA_URL) {
    res.status(413);
    throw new Error('That file is too large. Please upload a file under 2 MB.');
  }

  const user = req.user;
  const docs = (user.verificationDocs || []).filter((d) => d.key !== key);
  docs.push({
    key,
    label: known.label,
    fileName: String(fileName).slice(0, 180),
    fileType,
    fileSize: Number(fileSize) || 0,
    dataUrl,
    uploadedAt: new Date(),
  });

  user.verificationDocs = docs;
  // Replacing a document after a review restarts the review.
  if (user.verificationStatus !== 'approved') user.verificationStatus = 'unverified';

  const updated = await user.save();
  // The full documents list comes back too, so the Verification screen can
  // show the new thumbnail without a second request.
  res.json({
    success: true,
    user: sanitizeUser(updated),
    documents: updated.verificationDocs,
  });
});

// @desc    Remove one verification document
// @route   DELETE /api/auth/verification/:key
// @access  Private
export const deleteVerificationDoc = asyncHandler(async (req, res) => {
  const user = req.user;
  user.verificationDocs = (user.verificationDocs || []).filter((d) => d.key !== req.params.key);
  if (user.verificationStatus !== 'approved') user.verificationStatus = 'unverified';
  const updated = await user.save();
  res.json({
    success: true,
    user: sanitizeUser(updated),
    documents: updated.verificationDocs,
  });
});

// @desc    Submit the uploaded documents for review
// @route   POST /api/auth/verification/submit
// @access  Private
export const submitVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  const uploaded = new Set((user.verificationDocs || []).map((d) => d.key));
  const missing = VERIFICATION_DOCS.filter((d) => !uploaded.has(d.key));

  if (missing.length) {
    res.status(400);
    throw new Error(`Still missing: ${missing.map((d) => d.label).join(', ')}`);
  }

  user.verificationStatus = 'submitted';
  user.verificationSubmittedAt = new Date();
  user.verificationNote = '';
  const updated = await user.save();

  await Activity.create({
    user: user._id,
    userName: user.fullName,
    userEmail: user.email,
    activity: 'Verification documents submitted',
    module: 'Accounts',
    status: 'Pending',
    description: `${user.fullName} submitted ${user.verificationDocs.length} documents for verification.`,
  });

  res.json({
    success: true,
    user: sanitizeUser(updated),
    documents: updated.verificationDocs,
  });
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
