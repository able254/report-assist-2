import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardRouter } from './pages/DashboardRouter'

export function App() {
  const { session, logout } = useAuth()
  return (
    <div>
      <header style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/">ReportAssist</Link>
        <div style={{ marginLeft: 'auto' }}>
          {session ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Login
            </Link>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={session ? <DashboardRouter /> : <LoginPage />} />
      </Routes>
    </div>
  )
}

