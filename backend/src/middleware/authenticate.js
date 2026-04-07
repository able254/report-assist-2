const { decodeJwt } = require('jose');
const { ApiError } = require('../lib/errors');

/**
 * Authenticate Supabase JWT and attach req.auth.
 * NOTE: We decode first for app_metadata/sessionVersion, then verify user via Supabase.
 * This keeps implementation simple while still validating the token server-side.
 */
function authenticate({ supabaseAnon }) {
  if (!supabaseAnon) throw new Error('Missing supabaseAnon');

  return async (req, _res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
      if (!token) throw new ApiError({ statusCode: 401, code: 'AUTH_MISSING', message: 'Missing bearer token' });

      let decoded;
      try {
        decoded = decodeJwt(token);
      } catch {
        throw new ApiError({ statusCode: 401, code: 'AUTH_INVALID', message: 'Invalid token' });
      }

      const { data, error } = await supabaseAnon.auth.getUser(token);
      if (error || !data?.user) {
        throw new ApiError({ statusCode: 401, code: 'AUTH_INVALID', message: 'Invalid token' });
      }

      const user = data.user;
      const sessionVersion =
        decoded?.app_metadata?.sessionVersion ??
        decoded?.app_metadata?.session_version ??
        decoded?.user_metadata?.sessionVersion ??
        decoded?.user_metadata?.session_version ??
        0;

      req.auth = {
        userId: user.id,
        email: user.email || null,
        sessionVersion: Number(sessionVersion) || 0,
        role: user.app_metadata?.role || user.user_metadata?.role || null,
        raw: { decoded, user },
      };

      return next();
    } catch (e) {
      return next(e);
    }
  };
}

module.exports = { authenticate };

