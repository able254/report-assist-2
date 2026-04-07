const { ApiError } = require('../lib/errors');

class SessionManager {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async validateSession({ auth }) {
    const profile = await this.userRepository.getById(auth.userId);
    if (!profile) throw new ApiError({ statusCode: 401, code: 'AUTH_UNKNOWN_USER', message: 'Unknown user' });
    if (profile.account_status !== 'Active') {
      throw new ApiError({ statusCode: 403, code: 'ACCOUNT_INACTIVE', message: 'Account is inactive' });
    }
    if ((Number(auth.sessionVersion) || 0) !== Number(profile.session_version || 0)) {
      throw new ApiError({ statusCode: 401, code: 'SESSION_INVALIDATED', message: 'Session invalidated' });
    }
    return profile;
  }

  async invalidateUserSessions({ userId }) {
    // Supabase access tokens cannot be revoked directly; we invalidate by incrementing session_version.
    await this.userRepository.incrementSessionVersion(userId);
  }
}

module.exports = { SessionManager };

