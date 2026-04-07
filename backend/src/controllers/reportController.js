const { z } = require('zod');
const { ApiError } = require('../lib/errors');

const UpdateStatusSchema = z.object({
  status: z.string().min(1),
});

class ReportController {
  constructor({ reportService }) {
    this.reportService = reportService;
  }

  fromAi = async (req, res, next) => {
    try {
      const secret = process.env.BOTPRESS_WEBHOOK_SECRET || '';
      if (!secret) {
        throw new ApiError({
          statusCode: 500,
          code: 'CONFIG_MISSING',
          message: 'Missing BOTPRESS_WEBHOOK_SECRET',
        });
      }
      const got = req.headers['x-botpress-secret'];
      if (got !== secret) {
        throw new ApiError({ statusCode: 401, code: 'AUTH_INVALID', message: 'Invalid Botpress secret' });
      }

      // Botpress is not a user; log performedBy as "system".
      const report = await this.reportService.createFromAi({ performedBy: 'system', payload: req.body });
      res.status(201).json(report);
    } catch (e) {
      next(e);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const report = await this.reportService.getReport({ id });
      res.json(report);
    } catch (e) {
      next(e);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const parsed = UpdateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError({ statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid status payload' });
      }
      const id = req.params.id;
      const updated = await this.reportService.updateStatus({
        performedBy: req.auth.userId,
        role: req.auth.role,
        id,
        newStatus: parsed.data.status,
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { ReportController };

