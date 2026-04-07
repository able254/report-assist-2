class AdminController {
  constructor({ userService, auditLogRepository }) {
    this.userService = userService;
    this.auditLogRepository = auditLogRepository;
  }

  deactivateUser = async (req, res, next) => {
    try {
      const targetUserId = req.params.id;
      const result = await this.userService.deactivateUser({
        performedBy: req.auth.userId,
        targetUserId,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  listAuditLogs = async (_req, res, next) => {
    try {
      const logs = await this.auditLogRepository.listLatest({ limit: 200 });
      res.json(logs);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { AdminController };

