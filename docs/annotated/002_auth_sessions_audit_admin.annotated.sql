/*
Annotated reference copy of `src/database/migrations/002_auth_sessions_audit_admin.sql`.
This file is for learning/documentation only.
*/

-- This migration adds:
-- - account_status enum and users.account_status column
-- - SYSTEM_ADMIN to the role enum
-- - sessions table (server-side sessions for immediate logout)
-- - audit_logs table (system audit trail)
-- - case_number_counters table (unique RA-YYYY-XXXXX generation)

-- Starts a PostgreSQL DO block (runs procedural code).
DO $$
BEGIN
  -- If the enum type `account_status` doesn't exist yet...
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    -- ...create it with two allowed values.
    CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;
END$$;

-- Extend existing user_role enum to include SYSTEM_ADMIN (no-op if already present).
DO $$
BEGIN
  -- Only proceed if the enum type user_role exists at all.
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- If SYSTEM_ADMIN isn't already a label of the enum...
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'SYSTEM_ADMIN'
    ) THEN
      -- ...add SYSTEM_ADMIN as a new enum value.
      ALTER TYPE user_role ADD VALUE 'SYSTEM_ADMIN';
    END IF;
  END IF;
END$$;

-- Adds new columns to users to support account deactivation and timestamps.
ALTER TABLE users
  -- Adds account_status column if missing; defaults to ACTIVE.
  ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'ACTIVE',
  -- Adds updated_at if missing so we can track changes.
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Creates sessions table (server-side session store).
CREATE TABLE IF NOT EXISTS sessions (
  -- Primary key is the session token value stored in the cookie.
  session_id TEXT PRIMARY KEY,
  -- Links each session to a user; cascade deletes sessions when user is deleted.
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  -- Timestamp for session creation.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Timestamp for session revocation; when set, session becomes invalid.
  revoked_at TIMESTAMPTZ
);

-- Index to quickly find sessions by user.
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- Index to quickly filter revoked/non-revoked.
CREATE INDEX IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at);

-- Creates audit_logs table for admin/system audit trails.
CREATE TABLE IF NOT EXISTS audit_logs (
  -- Surrogate primary key for log entries.
  audit_log_id BIGSERIAL PRIMARY KEY,
  -- The user who performed the action (nullable if user later deleted).
  actor_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  -- Action name (string) e.g. TOGGLE_ACCOUNT_STATUS.
  action TEXT NOT NULL,
  -- Target user affected by the action, if applicable.
  target_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  -- Arbitrary structured details for the action.
  details JSONB,
  -- Optional client IP address captured by the app layer.
  ip_address TEXT,
  -- Optional user agent captured by the app layer.
  user_agent TEXT,
  -- Timestamp when the log entry was created.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying logs in time order.
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
-- Index for filtering by action.
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Unique case generation helper table (RA-YYYY-XXXXX).
CREATE TABLE IF NOT EXISTS case_number_counters (
  -- The year component of the case number.
  year INT PRIMARY KEY,
  -- The last issued counter for that year (incremented transactionally).
  last_value INT NOT NULL
);

