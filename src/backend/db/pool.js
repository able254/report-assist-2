const { Pool } = require('pg');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: requireEnv('PGUSER'),
  password: requireEnv('PGPASSWORD'),
  database: requireEnv('PGDATABASE'),
});

module.exports = { pool };

