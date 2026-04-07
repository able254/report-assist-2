const { z } = require('zod');
const { ApiError } = require('../lib/errors');

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

class AuthController {
  constructor({ supabaseAnon }) {
    this.supabaseAnon = supabaseAnon;
  }

  login = async (req, res, next) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError({ statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid login payload' });
      }

      const { data, error } = await this.supabaseAnon.auth.signInWithPassword(parsed.data);
      if (error || !data?.session) {
        throw new ApiError({ statusCode: 401, code: 'AUTH_INVALID', message: 'Invalid credentials' });
      }

      res.json({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
        user: data.user,
      });
    } catch (e) {
      next(e);
    }
  };

  logout = async (_req, res) => {
    // Supabase JWT revocation is not supported for access tokens; client discards tokens.
    res.json({ ok: true });
  };
}

module.exports = { AuthController };

