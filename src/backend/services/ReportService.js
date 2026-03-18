const { CaseFactory } = require('../factories/CaseFactory');

class ReportService {
  constructor({ pool }) {
    this.pool = pool;
    this.caseFactory = new CaseFactory({ pool });
  }

  async assign({ triageOfficerId, reportId, assignedOfficerId }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: existingRows } = await client.query(
        `SELECT report_id, status
         FROM reports
         WHERE report_id = $1
         FOR UPDATE`,
        [reportId],
      );
      if (existingRows.length === 0) {
        const err = new Error('Report not found');
        err.statusCode = 404;
        throw err;
      }
      if (existingRows[0].status !== 'PENDING') {
        const err = new Error('Report is not pending');
        err.statusCode = 409;
        throw err;
      }

      const caseNumber = await this.caseFactory.assignCaseNumber({ client });

      const { rows: updatedRows } = await client.query(
        `UPDATE reports
         SET status = 'ASSIGNED',
             case_number = $2,
             triage_officer_id = $3,
             assigned_officer_id = $4,
             updated_at = NOW()
         WHERE report_id = $1
         RETURNING report_id, status, case_number, triage_officer_id, assigned_officer_id`,
        [reportId, caseNumber, triageOfficerId, assignedOfficerId],
      );

      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_user_id, details)
         VALUES ($1, 'ASSIGN_REPORT', NULL, $2)`,
        [
          triageOfficerId,
          JSON.stringify({ reportId, caseNumber, assignedOfficerId }),
        ],
      );

      await client.query('COMMIT');
      return updatedRows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = { ReportService };

