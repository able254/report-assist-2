function requireSession({ sessionManager }) {
  return async (req, res, next) => {
    try {
      const sessionId = req.cookies?.ra_session;
      const result = await sessionManager.validateSession({ sessionId });
      if (!result.valid) {
        res.clearCookie('ra_session', { httpOnly: true, sameSite: 'lax' });
        return res.status(401).json({ success: false, reason: result.reason });
      }
      req.user = result.user;
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

function requireRole(roles) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!allowed.has(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    return next();
  };
}

module.exports = { requireSession, requireRole };

