class ApiError extends Error {
  constructor({ statusCode, code, message }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function errorResponse({ code, message }) {
  return { status: 'error', code, message };
}

module.exports = { ApiError, errorResponse };

