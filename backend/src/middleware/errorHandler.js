const config = require('../config/env');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Normalize known Mongoose / Multer errors into ApiError
  if (error.name === 'CastError') {
    error = ApiError.badRequest(`Invalid value for field '${error.path}'`);
  } else if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((val) => val.message);
    error = ApiError.badRequest('Validation failed', messages);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for '${field}'`);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Invalid or expired token');
  } else if (error.name === 'MulterError') {
    error = ApiError.badRequest(error.message);
  } else if (!(error instanceof ApiError)) {
    // Unknown/unexpected error — do not leak internals in production
    console.error('[unhandled error]', err);
    error = ApiError.internal(
      config.nodeEnv === 'production' ? 'Something went wrong' : err.message
    );
  }

  const response = {
    success: false,
    message: error.message,
  };

  if (error.details) response.details = error.details;
  if (config.nodeEnv !== 'production') response.stack = err.stack;

  res.status(error.statusCode || 500).json(response);
}

module.exports = errorHandler;
