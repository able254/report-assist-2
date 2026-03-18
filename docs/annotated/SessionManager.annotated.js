/**
 * Annotated reference copy of `src/backend/auth/SessionManager.js`.
 * This file is for learning/documentation only (not used by the app at runtime).
 */

// Imports Node's crypto module for secure random bytes.
const crypto = require('crypto');

// Declares the SessionManager class that owns login session lifecycle.
class SessionManager {
  // Constructor accepts dependencies using an object parameter.
  constructor({ pool }) {
    // Stores a Postgres connection pool for running queries.
    this.pool = pool;
  }

  /**
   * Creates a new DB-backed session row and returns its session_id.
   * Server-side sessions enable immediate logout: we can revoke them in the DB.
   */
  async createSession({ userId }) {
    // Generates a 32-byte random value and encodes it as hex (64 chars).
    const sessionId = crypto.randomBytes(32).toString('hex');
    // Inserts a new session row and returns the stored session_id.
    const { rows } = await this.pool.query(
      // SQL insert statement (parameterized to avoid SQL injection).
      `INSERT INTO sessions (session_id, user_id)
       VALUES ($1, $2)
       RETURNING session_id`,
      // Parameter values: $1=sessionId, $2=userId.
      [sessionId, userId],
    );
    // Returns the created session ID so callers can set it as a cookie.
    return rows[0].session_id;
  }

  // Revokes a single session (logout).
  async logout({ sessionId }) {
    // If there is no sessionId, do nothing.
    if (!sessionId) return;
    // Updates the session row to set revoked_at if it's not already revoked.
    await this.pool.query(
      // SQL update uses a guard `revoked_at IS NULL` so it is idempotent.
      `UPDATE sessions
       SET revoked_at = NOW()
       WHERE session_id = $1 AND revoked_at IS NULL`,
      // Parameter value: $1=sessionId.
      [sessionId],
    );
  }

  // Revokes all sessions belonging to a given user (used for admin deactivation).
  async revokeAllSessionsForUser({ userId }) {
    // Updates all non-revoked session rows for that user to revoked now.
    await this.pool.query(
      `UPDATE sessions
       SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      // Parameter value: $1=userId.
      [userId],
    );
  }

  /**
   * Validates a session ID and returns either:
   * - { valid: false, reason: <string> }
   * - { valid: true, user: { userId, role, accountStatus, sessionId } }
   *
   * This MUST be called on every request (middleware) and MUST check account_status.
   */
  async validateSession({ sessionId }) {
    // Rejects missing cookies/tokens.
    if (!sessionId) return { valid: false, reason: 'missing_session' };

    // Loads session + user in one query so we can validate both.
    const { rows } = await this.pool.query(
      // SQL selects key fields needed for validation & RBAC.
      `SELECT s.session_id,
              s.revoked_at,
              u.user_id,
              u.role,
              u.account_status
       FROM sessions s
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = $1`,
      // Parameter: $1=sessionId.
      [sessionId],
    );

    // If no row is returned, the session ID is unknown/invalid.
    if (rows.length === 0) return { valid: false, reason: 'unknown_session' };
    // Grabs the single row.
    const row = rows[0];
    // If revoked_at is set, the session has been revoked (logged out or deactivated).
    if (row.revoked_at) return { valid: false, reason: 'revoked' };
    // If the user is inactive, we deny access even if the session exists.
    if (row.account_status !== 'ACTIVE') return { valid: false, reason: 'inactive' };

    // Returns a normalized "authenticated user" object for route handlers.
    return {
      // Indicates validation success.
      valid: true,
      // User identity payload attached to req.user by middleware.
      user: {
        // Database user id.
        userId: row.user_id,
        // Role for RBAC checks.
        role: row.role,
        // Account status for policy enforcement.
        accountStatus: row.account_status,
        // The session id (useful for self-logout or auditing).
        sessionId: row.session_id,
      },
    };
  }
}

// Exports SessionManager so server.js and services can instantiate it.
module.exports = { SessionManager };

