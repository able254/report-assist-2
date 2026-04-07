import { BotpressChat } from '../components/BotpressChat'
import { useRealtimeReports } from '../hooks/useRealtimeReports'

export function CitizenPage() {
  const { reports } = useRealtimeReports()
  return (
    <div style={{ padding: 16 }}>
      <h2>Citizen Dashboard</h2>
      <p>Use the chatbot to submit a non-emergency report and track updates in real-time.</p>
      <BotpressChat />
      <div style={{ height: 16 }} />
      <h3>My Reports (Realtime)</h3>
      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            <strong>{r.case_number}</strong> — {r.status} (severity {r.severity_score})
          </li>
        ))}
      </ul>
    </div>
  )
}

