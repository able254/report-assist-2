const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');

function createRoutes({ controllers, supabaseAnon, sessionManager }) {
  const router = express.Router();

  // Auth
  router.post('/auth/login', controllers.auth.login);
  router.post('/auth/logout', controllers.auth.logout);

  // Botpress -> backend
  router.post('/reports/from-ai', controllers.reports.fromAi);

  // Protected routes
  router.use(authenticate({ supabaseAnon }));
  router.use(async (req, _res, next) => {
    try {
      const profile = await sessionManager.validateSession({ auth: req.auth });
      // prefer profile role/status from DB
      req.auth.role = profile.role;
      req.auth.accountStatus = profile.account_status;
      req.auth.sessionVersion = Number(profile.session_version || 0);
      next();
    } catch (e) {
      next(e);
    }
  });

  router.get('/reports/:id', controllers.reports.getById);
  router.patch('/reports/:id/status', controllers.reports.updateStatus);

  router.patch('/admin/users/:id/deactivate', requireRole(['SystemAdmin']), controllers.admin.deactivateUser);
  router.get('/admin/audit-logs', requireRole(['SystemAdmin']), controllers.admin.listAuditLogs);

  return router;
}

module.exports = { createRoutes };

