-- Adds: SYSTEM_ADMIN role, account_status, sessions, audit_logs, and case number counter
-- Assumes PostgreSQL.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;
END$$;

-- Extend existing user_role enum to include SYSTEM_ADMIN (no-op if already present).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'SYSTEM_ADMIN'
    ) THEN
      ALTER TYPE user_role ADD VALUE 'SYSTEM_ADMIN';
    END IF;
  END IF;
END$$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_log_id BIGSERIAL PRIMARY KEY,
  actor_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Unique case generation helper table (RA-YYYY-XXXXX).
CREATE TABLE IF NOT EXISTS case_number_counters (
  year INT PRIMARY KEY,
  last_value INT NOT NULL
);

