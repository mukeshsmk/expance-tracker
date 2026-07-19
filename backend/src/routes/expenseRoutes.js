const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/project/:projectId', expenseController.getExpensesByProject);

router.post(
  '/',
  upload.single('billFile'),
  [
    body('project').notEmpty().withMessage('Project is required'),
    body('expenseDate').isISO8601(),
    body('description').notEmpty().withMessage('Reason is required'),
    body('amount').isFloat({ min: 0 }),
    body('createdByName').notEmpty().withMessage('Creator name is required'),
  ],
  validate,
  expenseController.createExpense
);

router.put('/:id', upload.single('billFile'), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
