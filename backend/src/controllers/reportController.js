const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Expense = require('../models/Expense');
const Project = require('../models/Project');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reports/monthly?year=2026&project=
exports.getMonthlyReport = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), project } = req.query;

  const match = {
    expenseDate: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31T23:59:59`),
    },
  };
  if (project) match.project = project;

  const [monthlyResults, engineerResults] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { $month: '$expenseDate' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$createdByName', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const totalAmount = monthlyResults.reduce((sum, r) => sum + r.total, 0);
  const totalTransactions = monthlyResults.reduce((sum, r) => sum + r.count, 0);

  const months = monthNames.map((name, idx) => {
    const match = monthlyResults.find((r) => r._id === idx + 1);
    const total = match ? match.total : 0;
    const count = match ? match.count : 0;
    return {
      month: name,
      total,
      count,
      average: count ? Math.round((total / count) * 100) / 100 : 0,
      percentOfYear: totalAmount ? Math.round((total / totalAmount) * 10000) / 100 : 0,
    };
  });

  const peakMonth = months.reduce(
    (max, m) => (!max || m.total > max.total ? m : max),
    null
  );

  const byEngineer = engineerResults.map((r) => ({
    name: r._id || 'Unassigned',
    total: r.total,
    count: r.count,
    percentOfYear: totalAmount ? Math.round((r.total / totalAmount) * 10000) / 100 : 0,
  }));

  return ApiResponse.ok(res, 'Monthly report generated', {
    year: Number(year),
    summary: {
      totalAmount,
      totalTransactions,
      averageMonthly: Math.round((totalAmount / 12) * 100) / 100,
      averageTransaction: totalTransactions ? Math.round((totalAmount / totalTransactions) * 100) / 100 : 0,
      peakMonth: peakMonth && peakMonth.total > 0 ? { month: peakMonth.month, total: peakMonth.total } : null,
    },
    months,
    byEngineer,
  });
});

// GET /api/reports/project/:id
exports.getProjectReport = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('assignedEngineer', 'name email');
  if (!project) return ApiResponse.ok(res, 'Project not found', null);

  const expenses = await Expense.find({ project: project._id });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return ApiResponse.ok(res, 'Project report generated', {
    project,
    totalExpenses,
    remainingBudget: project.totalEstimationAmount - totalExpenses,
    expenseCount: expenses.length,
    expenses,
  });
});

// GET /api/reports/project/:id/export/excel
exports.exportProjectExcel = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  const expenses = await Expense.find({ project: project._id }).sort({ expenseDate: 1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Expenses');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Reason', key: 'description', width: 30 },
    { header: 'Price', key: 'amount', width: 14 },
    { header: 'Created By', key: 'createdByName', width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  expenses.forEach((e) => {
    sheet.addRow({
      date: e.expenseDate.toISOString().split('T')[0],
      description: e.description,
      amount: e.amount,
      createdByName: e.createdByName,
    });
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  sheet.addRow({});
  sheet.addRow({ description: 'TOTAL', amount: total }).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${project.projectName}-expenses.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

// GET /api/reports/project/:id/export/pdf
exports.exportProjectPdf = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('assignedEngineer', 'name');
  const expenses = await Expense.find({ project: project._id }).sort({ expenseDate: 1 });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${project.projectName}-report.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text(`Project Report: ${project.projectName}`, { underline: true });
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Client: ${project.clientName}`);
  doc.text(`Site Address: ${project.siteAddress}`);
  doc.text(`Engineer: ${project.assignedEngineer ? project.assignedEngineer.name : 'Unassigned'}`);
  doc.text(`Status: ${project.status}`);
  doc.text(`Total Estimation: ${project.totalEstimationAmount}`);
  doc.text(`Total Expenses: ${totalExpenses}`);
  doc.text(`Remaining Budget: ${project.totalEstimationAmount - totalExpenses}`);
  doc.moveDown();

  doc.fontSize(13).text('Expenses', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(9);
  expenses.forEach((e) => {
    doc.text(
      `${e.expenseDate.toISOString().split('T')[0]}  |  ${e.description}  |  ${e.amount}  |  ${e.createdByName}`
    );
  });

  doc.end();
});
