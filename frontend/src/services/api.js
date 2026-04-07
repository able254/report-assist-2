export class ApiClient {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl
  }

  async request(path, { method = 'GET', body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    const data = isJson ? await res.json() : null

    if (!res.ok) {
      const message = data?.message || data?.status || 'Request failed'
      const code = data?.code || 'REQUEST_FAILED'
      const err = new Error(message)
      err.code = code
      err.status = res.status
      throw err
    }
    return data
  }

  login({ email, password }) {
    return this.request('/api/auth/login', { method: 'POST', body: { email, password } })
  }

  logout() {
    return this.request('/api/auth/logout', { method: 'POST' })
  }

  getReport({ id, token }) {
    return this.request(`/api/reports/${id}`, { token })
  }

  updateReportStatus({ id, status, token }) {
    return this.request(`/api/reports/${id}/status`, { method: 'PATCH', body: { status }, token })
  }

  listAuditLogs({ token }) {
    return this.request('/api/admin/audit-logs', { token })
  }

  deactivateUser({ id, token }) {
    return this.request(`/api/admin/users/${id}/deactivate`, { method: 'PATCH', token })
  }
}

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
})

