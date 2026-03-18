const crypto = require('crypto');

class SessionManager {
  constructor({ pool }) {
    this.pool = pool;
  }

  /**
   * Creates a new DB-backed session. Storing sessions server-side is what enables
   * "immediate logout" even if a user still has a cookie.
   */
  async createSession({ userId }) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const { rows } = await this.pool.query(
      `INSERT INTO sessions (session_id, user_id)
       VALUES ($1, $2)
       RETURNING session_id`,
      [sessionId, userId],
    );
    return rows[0].session_id;
  }

  async logout({ sessionId }) {
    if (!sessionId) return;
    await this.pool.query(
      `UPDATE sessions
       SET revoked_at = NOW()
       WHERE session_id = $1 AND revoked_at IS NULL`,
      [sessionId],
    );
  }

  async revokeAllSessionsForUser({ userId }) {
    await this.pool.query(
      `UPDATE sessions
       SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  }

  /**
   * validateSession() must run on every request (middleware) and MUST check:
   * - session is not revoked
   * - user exists
   * - user's account_status is ACTIVE
   */
  async validateSession({ sessionId }) {
    if (!sessionId) return { valid: false, reason: 'missing_session' };

    const { rows } = await this.pool.query(
      `SELECT s.session_id,
              s.revoked_at,
              u.user_id,
              u.role,
              u.account_status
       FROM sessions s
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = $1`,
      [sessionId],
    );

    if (rows.length === 0) return { valid: false, reason: 'unknown_session' };
    const row = rows[0];
    if (row.revoked_at) return { valid: false, reason: 'revoked' };
    if (row.account_status !== 'ACTIVE') return { valid: false, reason: 'inactive' };

    return {
      valid: true,
      user: {
        userId: row.user_id,
        role: row.role,
        accountStatus: row.account_status,
        sessionId: row.session_id,
      },
    };
  }
}

module.exports = { SessionManager };

