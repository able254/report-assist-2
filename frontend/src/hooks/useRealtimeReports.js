import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useRealtimeReports() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [reports, setReports] = useState([])

  useEffect(() => {
    if (!userId) {
      setReports([])
      return
    }

    let channel
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.from('reports').select('*').eq('created_by', userId).order('created_at', { ascending: false })
      if (!mounted) return
      setReports(data || [])

      channel = supabase
        .channel(`reports-created-by-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reports', filter: `created_by=eq.${userId}` },
          (payload) => {
            setReports((prev) => {
              const next = prev.filter((r) => r.id !== payload.new?.id)
              if (payload.eventType === 'DELETE') return next
              return [payload.new, ...next].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            })
          },
        )
        .subscribe()
    }

    bootstrap()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId])

  return { reports }
}

