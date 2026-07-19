const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator checks; converts validation errors into a single ApiError
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(ApiError.badRequest('Validation failed', messages));
  }
  next();
}

module.exports = validate;
