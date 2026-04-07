const { ApiError, errorResponse } = require('../lib/errors');

function errorHandler(err, _req, res, _next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const code = err instanceof ApiError ? err.code : 'INTERNAL_ERROR';
  const message = err instanceof ApiError ? err.message : 'Server error';
  res.status(statusCode).json(errorResponse({ code, message }));
}

module.exports = { errorHandler };

