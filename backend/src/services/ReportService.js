const { z } = require('zod');
const { ApiError } = require('../lib/errors');
const { REPORT_STATUSES } = require('../models/Report');

const AiPayloadSchema = z.object({
  incidentType: z.string().min(1),
  description: z.string().min(1),
  timeline: z.array(z.any()).default([]),
  locations: z.array(z.any()).default([]),
  entities: z.array(z.any()).default([]),
  confidenceScore: z.number().min(0).max(1),
});

const FromAiSchema = z.object({
  createdBy: z.string().uuid(),
  transcript: z.string().min(1),
  structuredData: AiPayloadSchema,
});

class ReportService {
  constructor({ reportRepository, auditLogRepository, caseFactory }) {
    this.reportRepository = reportRepository;
    this.auditLogRepository = auditLogRepository;
    this.caseFactory = caseFactory;
  }

  async createFromAi({ performedBy, payload }) {
    const parsed = FromAiSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError({ statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid AI payload' });
    }

    const caseNumber = await this.caseFactory.generateCaseNumber();
    const severityScore = Math.round(parsed.data.structuredData.confidenceScore * 100);

    const report = await this.reportRepository.create({
      caseNumber,
      status: 'Pending',
      severityScore,
      transcript: parsed.data.transcript,
      structuredData: parsed.data.structuredData,
      createdBy: parsed.data.createdBy,
    });

    await this.auditLogRepository.log({
      actionType: 'REPORT_CREATED_FROM_AI',
      performedBy,
      targetEntity: 'reports',
      targetId: report.id,
      previousValue: null,
      newValue: report,
    });

    return report;
  }

  async getReport({ id }) {
    const report = await this.reportRepository.getById(id);
    if (!report) throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Report not found' });
    return report;
  }

  async updateStatus({ performedBy, role, id, newStatus }) {
    if (!REPORT_STATUSES.includes(newStatus)) {
      throw new ApiError({ statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid status' });
    }

    const current = await this.getReport({ id });
    this.#assertTransitionAllowed({ role, from: current.status, to: newStatus });

    const updated = await this.reportRepository.updateStatus({ id, status: newStatus });

    await this.auditLogRepository.log({
      actionType: 'REPORT_STATUS_CHANGED',
      performedBy,
      targetEntity: 'reports',
      targetId: id,
      previousValue: { status: current.status },
      newValue: { status: updated.status },
    });

    return updated;
  }

  #assertTransitionAllowed({ role, from, to }) {
    // Minimal strictness: Citizen cannot change status; Admin can; Officers limited.
    if (role === 'Citizen') {
      throw new ApiError({ statusCode: 403, code: 'RBAC_FORBIDDEN', message: 'Forbidden' });
    }
    if (role === 'SystemAdmin') return;

    const allowed = new Set();
    if (role === 'TriageOfficer') {
      ['Pending', 'Under Review', 'Assigned', 'Escalated', 'Rejected'].forEach((s) => allowed.add(s));
    }
    if (role === 'AssignedOfficer') {
      ['Assigned', 'In Progress', 'Closed', 'Escalated'].forEach((s) => allowed.add(s));
    }

    if (!allowed.has(from) || !allowed.has(to)) {
      throw new ApiError({ statusCode: 403, code: 'INVALID_TRANSITION', message: 'Invalid status transition' });
    }
  }
}

module.exports = { ReportService, FromAiSchema };

