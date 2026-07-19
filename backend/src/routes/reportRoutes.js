const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/monthly', reportController.getMonthlyReport);
router.get('/project/:id', reportController.getProjectReport);
router.get('/project/:id/export/excel', reportController.exportProjectExcel);
router.get('/project/:id/export/pdf', reportController.exportProjectPdf);

module.exports = router;
