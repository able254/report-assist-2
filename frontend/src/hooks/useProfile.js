import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useProfile() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!session?.user?.id) {
        setProfile(null)
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle()
      if (!mounted) return
      if (error) {
        console.error(error)
        setProfile(null)
      } else {
        setProfile(data ?? null)
      }
      setLoading(false)
    }
    run()
    return () => {
      mounted = false
    }
  }, [session?.user?.id])

  return { profile, loading }
}

