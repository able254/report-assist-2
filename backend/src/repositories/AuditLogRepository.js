class AuditLogRepository {
  constructor({ supabaseAdmin }) {
    this.supabaseAdmin = supabaseAdmin;
  }

  async log({
    actionType,
    performedBy,
    targetEntity,
    targetId = null,
    previousValue = null,
    newValue = null,
  }) {
    const { data, error } = await this.supabaseAdmin
      .from('audit_logs')
      .insert({
        action_type: actionType,
        performed_by: performedBy,
        target_entity: targetEntity,
        target_id: targetId,
        previous_value: previousValue,
        new_value: newValue,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async listLatest({ limit = 200 }) {
    const { data, error } = await this.supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
}

module.exports = { AuditLogRepository };

