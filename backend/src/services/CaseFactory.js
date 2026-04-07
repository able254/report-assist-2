class CaseFactory {
  constructor({ supabaseAdmin }) {
    this.supabaseAdmin = supabaseAdmin;
  }

  async generateCaseNumber() {
    const year = new Date().getFullYear();
    const { data, error } = await this.supabaseAdmin.rpc('next_case_number', { p_year: year });
    if (error) throw error;
    const n = Number(data);
    const padded = String(n).padStart(5, '0');
    return `OB-${year}-${padded}`;
  }
}

module.exports = { CaseFactory };

