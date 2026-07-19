const mongoose = require('mongoose');
const Project = require('../models/Project');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Attaches computed budget fields (totalExpenses, remainingBudget, utilization %) to a project
async function withBudgetFields(project) {
  const agg = await Expense.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalExpenses = agg.length ? agg[0].total : 0;
  const remainingBudget = project.totalEstimationAmount - totalExpenses;
  const utilization = project.totalEstimationAmount
    ? Math.round((totalExpenses / project.totalEstimationAmount) * 10000) / 100
    : 0;

  return {
    ...project.toObject(),
    totalExpenses,
    remainingBudget,
    budgetUtilizationPercent: utilization,
    budgetStatus: utilization >= 100 ? 'exceeded' : utilization >= 80 ? 'warning' : 'ok',
  };
}

// GET /api/projects
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('assignedEngineer', 'name email')
    .sort({ createdAt: -1 });

  const withBudgets = await Promise.all(projects.map(withBudgetFields));
  return ApiResponse.ok(res, 'Projects fetched', withBudgets);
});

// GET /api/projects/:id
exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('assignedEngineer', 'name email');
  if (!project) throw ApiError.notFound('Project not found');

  const withBudget = await withBudgetFields(project);
  return ApiResponse.ok(res, 'Project fetched', withBudget);
});

// POST /api/projects
exports.createProject = asyncHandler(async (req, res) => {
  const {
    projectName,
    clientName,
    siteAddress,
    assignedEngineer,
    startDate,
    expectedEndDate,
    totalEstimationAmount,
    initialInvestedAmount,
    status,
  } = req.body;

  if (assignedEngineer) {
    const engineer = await User.findOne({ _id: assignedEngineer, role: 'site_engineer' });
    if (!engineer) throw ApiError.badRequest('Assigned engineer not found');
  }

  const project = await Project.create({
    projectName,
    clientName,
    siteAddress,
    assignedEngineer: assignedEngineer || undefined,
    startDate,
    expectedEndDate,
    totalEstimationAmount,
    initialInvestedAmount: initialInvestedAmount || 0,
    status: status || 'Planning',
  });

  if (assignedEngineer) {
    await User.findByIdAndUpdate(assignedEngineer, { $addToSet: { assignedProjects: project._id } });
  }

  return ApiResponse.created(res, 'Project created successfully', project);
});

// PUT /api/projects/:id
exports.updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const previousEngineer = project.assignedEngineer;
  const wasCompleted = project.status === 'Completed';

  Object.assign(project, req.body);
  await project.save();

  // Keep User.assignedProjects in sync if engineer changed
  if (req.body.assignedEngineer && String(req.body.assignedEngineer) !== String(previousEngineer)) {
    if (previousEngineer) {
      await User.findByIdAndUpdate(previousEngineer, { $pull: { assignedProjects: project._id } });
    }
    await User.findByIdAndUpdate(req.body.assignedEngineer, {
      $addToSet: { assignedProjects: project._id },
    });
  }

  if (!wasCompleted && project.status === 'Completed' && project.assignedEngineer) {
    await Notification.create({
      user: project.assignedEngineer,
      type: 'PROJECT_COMPLETED',
      project: project._id,
      message: `Project "${project.projectName}" has been marked as completed`,
    });
  }

  return ApiResponse.ok(res, 'Project updated successfully', project);
});

// DELETE /api/projects/:id
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const expenseCount = await Expense.countDocuments({ project: project._id });
  if (expenseCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete project: ${expenseCount} expense record(s) are linked to it. Remove expenses first.`
    );
  }

  await project.deleteOne();
  return ApiResponse.ok(res, 'Project deleted successfully', { id: req.params.id });
});
