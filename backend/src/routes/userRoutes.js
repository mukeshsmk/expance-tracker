const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', userController.getUsers);

router.post(
  '/',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'site_engineer']),
  ],
  validate,
  userController.createUser
);

router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
