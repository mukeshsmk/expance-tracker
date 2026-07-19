const { put } = require('@vercel/blob');
const Expense = require('../models/Expense');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { billFileName } = require('../middleware/upload');

// Uploads the multer in-memory file buffer to Vercel Blob and returns the billFile shape
async function uploadBillFile(file) {
  const blob = await put(billFileName(file.originalname), file.buffer, {
    access: 'public',
    contentType: file.mimetype,
  });
  return {
    url: blob.url,
    originalName: file.originalname,
    mimeType: file.mimetype,
  };
}

// Checks budget thresholds after an expense is added and notifies the admin + engineer
async function checkBudgetThresholds(project) {
  const agg = await Expense.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalExpenses = agg.length ? agg[0].total : 0;
  const utilization = project.totalEstimationAmount
    ? (totalExpenses / project.totalEstimationAmount) * 100
    : 0;

  const recipients = new Set();
  if (project.assignedEngineer) recipients.add(project.assignedEngineer.toString());
  const admins = await User.find({ role: 'admin' }).select('_id');
  admins.forEach((a) => recipients.add(a._id.toString()));

  const notifications = [];
  if (utilization >= 100) {
    recipients.forEach((userId) =>
      notifications.push({
        user: userId,
        type: 'BUDGET_EXCEEDED',
        project: project._id,
        message: `Budget Limit Exceeded for project "${project.projectName}"`,
      })
    );
  } else if (utilization >= 80) {
    recipients.forEach((userId) =>
      notifications.push({
        user: userId,
        type: 'BUDGET_WARNING_80',
        project: project._id,
        message: `Project "${project.projectName}" has reached ${utilization.toFixed(1)}% of its budget`,
      })
    );
  }

  if (notifications.length) await Notification.insertMany(notifications);
  return { totalExpenses, utilization };
}

// GET /api/expenses/project/:projectId
exports.getExpensesByProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw ApiError.notFound('Project not found');

  const { startDate, endDate, page = 1, limit = 20, sortBy = 'expenseDate', sortDir = 'desc' } =
    req.query;

  const filter = { project: project._id };
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Expense.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, 'Expenses fetched', expenses, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// POST /api/expenses
exports.createExpense = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project);
  if (!project) throw ApiError.notFound('Project not found');

  const expenseData = { ...req.body };

  if (req.file) {
    expenseData.billFile = await uploadBillFile(req.file);
  }

  const expense = await Expense.create(expenseData);
  const { totalExpenses, utilization } = await checkBudgetThresholds(project);

  return ApiResponse.created(res, 'Expense added successfully', {
    expense,
    projectTotalExpenses: totalExpenses,
    projectBudgetUtilizationPercent: Math.round(utilization * 100) / 100,
  });
});

// PUT /api/expenses/:id
exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw ApiError.notFound('Expense not found');

  const project = await Project.findById(expense.project);
  if (!project) throw ApiError.notFound('Project not found');

  const updatable = ['expenseDate', 'description', 'amount', 'createdByName'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) expense[field] = req.body[field];
  });

  if (req.file) {
    expense.billFile = await uploadBillFile(req.file);
  }

  await expense.save();
  await checkBudgetThresholds(project);

  return ApiResponse.ok(res, 'Expense updated successfully', expense);
});

// DELETE /api/expenses/:id
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw ApiError.notFound('Expense not found');

  await expense.deleteOne();
  return ApiResponse.ok(res, 'Expense deleted successfully', { id: req.params.id });
});
