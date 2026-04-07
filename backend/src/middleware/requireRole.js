const { ApiError } = require('../lib/errors');

function requireRole(roles) {
  const allowed = new Set(roles);
  return (req, _res, next) => {
    if (!req.auth?.role) {
      return next(new ApiError({ statusCode: 403, code: 'RBAC_FORBIDDEN', message: 'Forbidden' }));
    }
    if (!allowed.has(req.auth.role)) {
      return next(new ApiError({ statusCode: 403, code: 'RBAC_FORBIDDEN', message: 'Forbidden' }));
    }
    return next();
  };
}

module.exports = { requireRole };

