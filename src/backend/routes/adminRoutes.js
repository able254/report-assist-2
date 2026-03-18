const express = require('express');
const router = express.Router();

const { requireRole } = require('../middleware/auth');

/**
 * Factory: inject dependencies from server.js
 */
function createAdminRoutes({ sessionManager, userService, pool }) {
  // all admin routes require SYSTEM_ADMIN
  router.use(requireRole(['SYSTEM_ADMIN']));
    // Middleware: All routes here require SYSTEM_ADMIN role
    router.use(requireRole(['SYSTEM_ADMIN']));

  router.get('/logs', async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT audit_log_id, actor_user_id, action, target_user_id, details, ip_address, user_agent, created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT 200`,
      );
      res.json({ success: true, logs: rows });
    } catch (e) {
      next(e);
    }
  });
    // GET /api/admin/logs
    router.get('/logs', async (req, res, next) => {
        try {
            const logs = await userService.reviewLogs(req.user.userId);
            res.json({ success: true, logs });
        } catch (e) {
            next(e);
        }
    });

  router.post('/users/:userId/status', async (req, res, next) => {
    try {
      const targetUserId = Number(req.params.userId);
      const { status } = req.body;
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
    // POST /api/admin/user-status
    router.post('/user-status', async (req, res, next) => {
        try {
            const { userId, status } = req.body;
            const result = await userService.toggleAccountStatus(req.user.userId, userId, status);
            res.json(result);
        } catch (e) {
            next(e);
        }
    });

      const updated = await userService.toggleAccountStatus({
        adminUserId: req.user.userId,
        targetUserId,
        status,
      });

      // if admin deactivated *their own* account, also log them out immediately
      if (status === 'INACTIVE' && req.user.userId === targetUserId) {
        await sessionManager.logout({ sessionId: req.user.sessionId });
        res.clearCookie('ra_session', { httpOnly: true, sameSite: 'lax' });
      }

      res.json({ success: true, user: updated });
    } catch (e) {
      next(e);
    }
  });

  return router;
    return router;
}

module.exports = { createAdminRoutes };

