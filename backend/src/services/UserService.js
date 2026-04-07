const { ApiError } = require('../lib/errors');

class UserService {
  constructor({ userRepository, auditLogRepository, supabaseAdmin }) {
    this.userRepository = userRepository;
    this.auditLogRepository = auditLogRepository;
    this.supabaseAdmin = supabaseAdmin;
  }

  async createUser({ id, name, email, role }) {
    return this.userRepository.createUser({ id, name, email, role });
  }

  async deactivateUser({ performedBy, targetUserId }) {
    if (!this.supabaseAdmin) {
      throw new ApiError({
        statusCode: 500,
        code: 'SUPABASE_ADMIN_MISSING',
        message: 'Missing SUPABASE_SERVICE_ROLE_KEY on backend',
      });
    }

    const before = await this.userRepository.getById(targetUserId);
    if (!before) throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'User not found' });

    const updated = await this.userRepository.updateAccountStatus(targetUserId, 'Deactivated');
    const bumped = await this.userRepository.incrementSessionVersion(targetUserId);

    await this.supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      app_metadata: {
        ...(before.app_metadata || {}),
        role: before.role,
        sessionVersion: bumped.session_version,
      },
      ban_duration: '87600h', // 10 years "effectively banned" until reactivated
    });

    await this.auditLogRepository.log({
      actionType: 'USER_DEACTIVATED',
      performedBy,
      targetEntity: 'users',
      targetId: targetUserId,
      previousValue: before,
      newValue: { ...updated, session_version: bumped.session_version },
    });

    return { ...updated, session_version: bumped.session_version };
  }

  async reactivateUser({ performedBy, targetUserId }) {
    if (!this.supabaseAdmin) {
      throw new ApiError({
        statusCode: 500,
        code: 'SUPABASE_ADMIN_MISSING',
        message: 'Missing SUPABASE_SERVICE_ROLE_KEY on backend',
      });
    }

    const before = await this.userRepository.getById(targetUserId);
    if (!before) throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'User not found' });

    const updated = await this.userRepository.updateAccountStatus(targetUserId, 'Active');
    const bumped = await this.userRepository.incrementSessionVersion(targetUserId);

    await this.supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      app_metadata: {
        ...(before.app_metadata || {}),
        role: before.role,
        sessionVersion: bumped.session_version,
      },
      ban_duration: 'none',
    });

    await this.auditLogRepository.log({
      actionType: 'USER_REACTIVATED',
      performedBy,
      targetEntity: 'users',
      targetId: targetUserId,
      previousValue: before,
      newValue: { ...updated, session_version: bumped.session_version },
    });

    return { ...updated, session_version: bumped.session_version };
  }
}

module.exports = { UserService };

