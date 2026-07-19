const Project = require('../models/Project');
const Expense = require('../models/Expense');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/summary
exports.getSummary = asyncHandler(async (req, res) => {
  const projects = await Project.find();
  const projectIds = projects.map((p) => p._id);

  const expenseAgg = await Expense.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalExpenses = expenseAgg.length ? expenseAgg[0].total : 0;

  const totalEstimatedCost = projects.reduce((sum, p) => sum + p.totalEstimationAmount, 0);
  const totalInvestedAmount = projects.reduce((sum, p) => sum + p.initialInvestedAmount, 0);
  const activeProjects = projects.filter((p) => p.status === 'Ongoing').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  return ApiResponse.ok(res, 'Dashboard summary generated', {
    totalProjects: projects.length,
    totalEstimatedCost,
    totalInvestedAmount,
    totalExpenses,
    remainingBudget: totalEstimatedCost - totalExpenses,
    activeProjects,
    completedProjects,
  });
});

// GET /api/dashboard/charts
exports.getChartData = asyncHandler(async (req, res) => {
  const projects = await Project.find();
  const projectIds = projects.map((p) => p._id);

  const monthly = await Expense.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { year: { $year: '$expenseDate' }, month: { $month: '$expenseDate' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const budgetVsExpense = await Promise.all(
    projects.map(async (p) => {
      const agg = await Expense.aggregate([
        { $match: { project: p._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return {
        projectName: p.projectName,
        budget: p.totalEstimationAmount,
        expenses: agg.length ? agg[0].total : 0,
      };
    })
  );

  return ApiResponse.ok(res, 'Chart data generated', {
    monthlyExpenseTrend: monthly.map((m) => ({
      label: `${m._id.month}/${m._id.year}`,
      total: m.total,
    })),
    budgetVsExpense,
  });
});
