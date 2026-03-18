const express = require('express');
const path = require('path');
const reportRoutes = require('./routes/reportRoutes');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const { pool } = require('./db/pool');
const { SessionManager } = require('./auth/SessionManager');
const { UserService } = require('./services/UserService');
const { requireSession } = require('./middleware/auth');
const { createAuthRoutes } = require('./routes/authRoutes');
const { createAdminRoutes } = require('./routes/adminRoutes');
const { createTriageRoutes } = require('./routes/triageRoutes');
const { ReportService } = require('./services/ReportService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies from API requests
app.use(express.json());
app.use(cookieParser());

// Serve static files (HTML, CSS, JS) from the 'public' directory
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(publicPath));

const sessionManager = new SessionManager({ pool });
const userService = new UserService({ pool, sessionManager });
const reportService = new ReportService({ pool });

// Use the API routes
app.use('/api/auth', createAuthRoutes({ pool, sessionManager }));
app.use('/api/reports', reportRoutes);

// All routes below require a validated session (accountStatus checked every request)
app.use('/api', requireSession({ sessionManager }));
app.use('/api/admin', createAdminRoutes({ sessionManager, userService, pool }));
app.use('/api/triage', createTriageRoutes({ reportService }));

// A catch-all to redirect to the main page if a route isn't found by the static server
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Basic error handler (so async route errors aren't swallowed)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
