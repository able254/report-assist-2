const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { createSupabaseClients } = require('./lib/supabase');
const { errorHandler } = require('./middleware/errorHandler');
const { createRoutes } = require('./routes');

const { UserRepository } = require('./repositories/UserRepository');
const { ReportRepository } = require('./repositories/ReportRepository');
const { AuditLogRepository } = require('./repositories/AuditLogRepository');

const { SessionManager } = require('./services/SessionManager');
const { CaseFactory } = require('./services/CaseFactory');
const { UserService } = require('./services/UserService');
const { ReportService } = require('./services/ReportService');

const { AuthController } = require('./controllers/authController');
const { ReportController } = require('./controllers/reportController');
const { AdminController } = require('./controllers/adminController');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const { supabaseAnon, supabaseAdmin } = createSupabaseClients();
if (!supabaseAdmin) {
  // backend can still run, but admin actions + DB writes will fail
  // (we keep the warning explicit in logs)
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin routes and DB writes will fail.');
}

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

// Repositories & services
const userRepository = new UserRepository({ supabaseAdmin });
const reportRepository = new ReportRepository({ supabaseAdmin });
const auditLogRepository = new AuditLogRepository({ supabaseAdmin });
const caseFactory = new CaseFactory({ supabaseAdmin });

const sessionManager = new SessionManager({ userRepository });
const userService = new UserService({ userRepository, auditLogRepository, supabaseAdmin });
const reportService = new ReportService({ reportRepository, auditLogRepository, caseFactory });

// Controllers
const controllers = {
  auth: new AuthController({ supabaseAnon }),
  reports: new ReportController({ reportService }),
  admin: new AdminController({ userService, auditLogRepository }),
};

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', createRoutes({ controllers, supabaseAnon, sessionManager }));

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = { app };
