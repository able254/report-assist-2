class UserService {
  constructor({ pool, sessionManager }) {
    this.pool = pool;
    this.sessionManager = sessionManager;
  }

  /**
   * Admin action: toggleAccountStatus(userId, status)
   * Requirement: when status becomes INACTIVE, immediately invalidate sessions.
   */
  async toggleAccountStatus({ adminUserId, targetUserId, status }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE users
         SET account_status = $2, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, username, role, account_status`,
        [targetUserId, status],
      );
      if (rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }

      const updated = rows[0];

      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_user_id, details)
         VALUES ($1, 'TOGGLE_ACCOUNT_STATUS', $2, $3)`,
        [
          adminUserId,
          targetUserId,
          JSON.stringify({ newStatus: status, role: updated.role }),
        ],
      );

      if (status === 'INACTIVE') {
        // immediate logout: revoke all server-side sessions now
        await client.query(
          `UPDATE sessions
           SET revoked_at = NOW()
           WHERE user_id = $1 AND revoked_at IS NULL`,
          [targetUserId],
        );
      }

      await client.query('COMMIT');
      return updated;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = { UserService };

