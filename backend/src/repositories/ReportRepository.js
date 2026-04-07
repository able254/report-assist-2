class ReportRepository {
  constructor({ supabaseAdmin }) {
    this.supabaseAdmin = supabaseAdmin;
  }

  async create({
    caseNumber,
    status,
    severityScore,
    transcript,
    structuredData,
    createdBy,
    assignedTo = null,
  }) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabaseAdmin
      .from('reports')
      .insert({
        case_number: caseNumber,
        status,
        severity_score: severityScore,
        transcript,
        structured_data: structuredData,
        created_by: createdBy,
        assigned_to: assignedTo,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await this.supabaseAdmin.from('reports').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateStatus({ id, status }) {
    const { data, error } = await this.supabaseAdmin
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async assignOfficer({ id, assignedTo }) {
    const { data, error } = await this.supabaseAdmin
      .from('reports')
      .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = { ReportRepository };

