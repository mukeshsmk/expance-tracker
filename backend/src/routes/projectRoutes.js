const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

router.post(
  '/',
  [
    body('projectName').notEmpty(),
    body('clientName').notEmpty(),
    body('startDate').isISO8601(),
    body('expectedEndDate').isISO8601(),
    body('totalEstimationAmount').isFloat({ min: 0 }),
  ],
  validate,
  projectController.createProject
);

router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
