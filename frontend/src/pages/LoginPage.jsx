import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h2>ReportAssist</h2>
      <p>Sign in to access your dashboard.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          try {
            await login({ email, password })
          } catch (err) {
            setError(err?.message || 'Login failed')
          }
        }}
      >
        <label>
          Email
          <input style={{ width: '100%', padding: 8 }} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <div style={{ height: 10 }} />
        <label>
          Password
          <input
            style={{ width: '100%', padding: 8 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div style={{ height: 12 }} />
        <button type="submit">Login</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </div>
  )
}

