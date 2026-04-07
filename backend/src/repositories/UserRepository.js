class UserRepository {
  constructor({ supabaseAdmin }) {
    this.supabaseAdmin = supabaseAdmin;
  }

  async getById(id) {
    const { data, error } = await this.supabaseAdmin.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createUser({ id, name, email, role }) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabaseAdmin
      .from('users')
      .insert({
        id,
        name,
        email,
        role,
        account_status: 'Active',
        session_version: 0,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async updateAccountStatus(id, status) {
    const { data, error } = await this.supabaseAdmin
      .from('users')
      .update({ account_status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async incrementSessionVersion(id) {
    const { data: current, error: readErr } = await this.supabaseAdmin
      .from('users')
      .select('session_version')
      .eq('id', id)
      .single();
    if (readErr) throw readErr;

    const next = Number(current.session_version || 0) + 1;
    const { data, error } = await this.supabaseAdmin
      .from('users')
      .update({ session_version: next, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = { UserRepository };

