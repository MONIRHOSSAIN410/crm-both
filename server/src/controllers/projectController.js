import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';

// @desc    List projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  const { status, category, search, limit = 50, page = 1 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Project.countDocuments(query),
  ]);

  res.json({ success: true, count: projects.length, total, projects });
});

// @desc    Project counts by status
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = asyncHandler(async (req, res) => {
  const grouped = await Project.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, raised: { $sum: '$raised' } } },
  ]);

  const stats = { pending: 0, approved: 0, live: 0, closed: 0, rejected: 0 };
  grouped.forEach((g) => {
    stats[g._id] = g.count;
  });

  const byCategory = await Project.aggregate([
    { $group: { _id: '$category', total: { $sum: '$raised' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  res.json({ success: true, stats, byCategory, total: await Project.countDocuments() });
});

// @desc    Single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner', 'fullName email avatar');
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json({ success: true, project });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    owner: req.body.owner || req.user._id,
    ownerName: req.body.ownerName || req.user.fullName,
  });

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    userEmail: req.user.email,
    activity: 'Created project',
    module: 'Projects',
    status: 'Success',
    description: `Project "${project.title}" submitted for review.`,
  });

  res.status(201).json({ success: true, project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    userEmail: req.user.email,
    activity: 'Updated project',
    module: 'Projects',
    status: 'Success',
    projectId: String(project._id).slice(-6),
    description: `Project "${project.title}" was updated.`,
  });

  res.json({ success: true, project });
});

// @desc    Approve / reject / close a project
// @route   PATCH /api/projects/:id/status
// @access  Private/Admin
export const setProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'live', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid project status');
  }
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  project.status = status;
  await project.save();

  await Activity.create({
    user: req.user._id,
    userName: req.user.fullName,
    activity: `Project ${status}`,
    module: 'Projects',
    status: 'Success',
    isAdminAction: true,
    description: `"${project.title}" is now ${status}.`,
  });

  res.json({ success: true, project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json({ success: true, message: 'Project removed' });
});
