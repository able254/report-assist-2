class CaseFactory {
  constructor({ pool }) {
    this.pool = pool;
  }

  async generateCaseNumber({ client }) {
    const year = new Date().getFullYear();

    // Atomic increment per-year (works under concurrency)
    const { rows } = await client.query(
      `INSERT INTO case_number_counters (year, last_value)
       VALUES ($1, 1)
       ON CONFLICT (year)
       DO UPDATE SET last_value = case_number_counters.last_value + 1
       RETURNING last_value`,
      [year],
    );

    const n = rows[0].last_value;
    const padded = String(n).padStart(5, '0');
    return `RA-${year}-${padded}`;
  }

  /**
   * Instantiates a report assignment by generating a case number.
   * The caller should be in a DB transaction.
   */
  async assignCaseNumber({ client }) {
    return this.generateCaseNumber({ client });
  }
}

module.exports = { CaseFactory };

