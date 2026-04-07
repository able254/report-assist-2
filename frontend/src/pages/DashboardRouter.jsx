import { Navigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { CitizenPage } from './CitizenPage'
import { OfficerPage } from './OfficerPage'
import { AdminPage } from './AdminPage'

export function DashboardRouter() {
  const { profile, loading } = useProfile()
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>
  if (!profile) return <div style={{ padding: 16 }}>No profile found. (Create row in public.users)</div>

  if (profile.role === 'Citizen') return <CitizenPage />
  if (profile.role === 'TriageOfficer' || profile.role === 'AssignedOfficer') return <OfficerPage />
  if (profile.role === 'SystemAdmin') return <AdminPage />
  return <Navigate to="/login" replace />
}

