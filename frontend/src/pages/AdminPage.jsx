import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export function AdminPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!token) return
      try {
        const data = await api.listAuditLogs({ token })
        if (!mounted) return
        setLogs(data)
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Failed to load logs')
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [token])

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Target</th>
            <th>By</th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(0, 100).map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.action_type}</td>
              <td>{l.target_entity}</td>
              <td>{l.target_id}</td>
              <td>{l.performed_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

