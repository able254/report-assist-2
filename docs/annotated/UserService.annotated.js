/**
 * Annotated reference copy of `src/backend/services/UserService.js`.
 * This file is for learning/documentation only (not used by the app at runtime).
 */

// Declares a service class responsible for user-related business logic.
class UserService {
  // Constructor uses dependency injection (pool + session manager).
  constructor({ pool, sessionManager }) {
    // Stores the Postgres pool to run queries/transactions.
    this.pool = pool;
    // Stores SessionManager (not used directly in this method, but kept as a dependency).
    this.sessionManager = sessionManager;
  }

  /**
   * Admin action: toggleAccountStatus
   * - Updates the user's account_status.
   * - Writes an audit log row.
   * - If INACTIVE, revokes ALL active sessions for that user (immediate logout).
   */
  async toggleAccountStatus({ adminUserId, targetUserId, status }) {
    // Opens a dedicated client connection so we can run a transaction.
    const client = await this.pool.connect();
    try {
      // Begins a SQL transaction.
      await client.query('BEGIN');

      // Updates the user's status and returns key fields for the response.
      const { rows } = await client.query(
        // Parameterized SQL avoids injection and keeps types correct.
        `UPDATE users
         SET account_status = $2, updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, username, role, account_status`,
        // Parameters: $1=targetUserId, $2=status.
        [targetUserId, status],
      );
      // If no user row was updated, the user doesn't exist.
      if (rows.length === 0) {
        // Creates an error with a human-friendly message.
        const err = new Error('User not found');
        // Adds an HTTP status code used by the Express error handler.
        err.statusCode = 404;
        // Throws to abort the transaction and propagate the error.
        throw err;
      }

      // Stores the updated user row for later use.
      const updated = rows[0];

      // Records the action in audit_logs for accountability and traceability.
      await client.query(
        // Inserts an audit log entry (actor, action name, target, and JSON details).
        `INSERT INTO audit_logs (actor_user_id, action, target_user_id, details)
         VALUES ($1, 'TOGGLE_ACCOUNT_STATUS', $2, $3)`,
        // Parameters: actor admin, target user, details JSON.
        [
          adminUserId,
          targetUserId,
          JSON.stringify({ newStatus: status, role: updated.role }),
        ],
      );

      // If the admin deactivated the account, revoke all sessions immediately.
      if (status === 'INACTIVE') {
        // Marks all still-active sessions as revoked in the same transaction.
        await client.query(
          `UPDATE sessions
           SET revoked_at = NOW()
           WHERE user_id = $1 AND revoked_at IS NULL`,
          // Parameter: $1=targetUserId.
          [targetUserId],
        );
      }

      // Commits the transaction: both status change and session revocation become visible together.
      await client.query('COMMIT');
      // Returns the updated user row to the controller/route handler.
      return updated;
    } catch (e) {
      // Rolls back any partial changes if anything failed.
      await client.query('ROLLBACK');
      // Rethrows the error so the API can return an appropriate response.
      throw e;
    } finally {
      // Releases the client back to the pool so it can be reused.
      client.release();
    }
  }
}

// Exports UserService for server.js to construct and inject into routes/controllers.
module.exports = { UserService };

