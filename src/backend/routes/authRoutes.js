const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

function createAuthRoutes({ pool, sessionManager }) {
  router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Missing username/password' });
      }

      const { rows } = await pool.query(
        `SELECT user_id, username, password_hash, role, account_status
         FROM users
         WHERE username = $1`,
        [username],
      );
      if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const user = rows[0];
      if (user.account_status !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const sessionId = await sessionManager.createSession({ userId: user.user_id });
      res.cookie('ra_session', sessionId, { httpOnly: true, sameSite: 'lax' });
      res.json({ success: true, user: { userId: user.user_id, username: user.username, role: user.role } });
    } catch (e) {
      next(e);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const sessionId = req.cookies?.ra_session;
      await sessionManager.logout({ sessionId });
      res.clearCookie('ra_session', { httpOnly: true, sameSite: 'lax' });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = { createAuthRoutes };

const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // --- MOCK IMPLEMENTATION ---
    // TODO: Replace with actual database lookup and password hashing comparison
    console.log(`Login attempt for user: ${username}`);
    if (username === 'citizen@test.com' && password === 'password') {
        return res.json({
            success: true,
            user: { username: 'citizen@test.com', role: 'CITIZEN' },
            token: 'mock-jwt-for-citizen'
        });
    } else if (username === 'triage@police.gov' && password === 'password') {
        return res.json({
            success: true,
            user: { username: 'triage@police.gov', role: 'TRIAGE_OFFICER', badgeId: 'T789' },
            token: 'mock-jwt-for-triage'
        });
    } else if (username === 'officer@police.gov' && password === 'password') {
        return res.json({
            success: true,
            user: { username: 'officer@police.gov', role: 'ASSIGNED_OFFICER', badgeId: 'O123' },
            token: 'mock-jwt-for-officer'
        });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials.' });
});

module.exports = router;
