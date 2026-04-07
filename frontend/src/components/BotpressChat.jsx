import { useEffect, useRef } from 'react'

/**
 * Minimal Botpress Webchat embed.
 * Configure URL + botId in env vars:
 * - VITE_BOTPRESS_HOST
 * - VITE_BOTPRESS_BOT_ID
 */
export function BotpressChat() {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    const host = import.meta.env.VITE_BOTPRESS_HOST
    const botId = import.meta.env.VITE_BOTPRESS_BOT_ID
    if (!host || !botId) return

    const s1 = document.createElement('script')
    s1.src = `${host}/webchat/v1/inject.js`
    s1.async = true
    document.body.appendChild(s1)

    const s2 = document.createElement('script')
    s2.src = `${host}/webchat/v1/config.js`
    s2.async = true
    s2.onload = () => {
      window.botpressWebChat?.init({
        botId,
        hostUrl: host,
        messagingUrl: host,
        composerPlaceholder: 'Describe what happened...',
        showCloseButton: true,
      })
    }
    document.body.appendChild(s2)
  }, [])

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <strong>AI Interview (Botpress)</strong>
      <div style={{ fontSize: 13, opacity: 0.85 }}>
        Configure <code>VITE_BOTPRESS_HOST</code> and <code>VITE_BOTPRESS_BOT_ID</code> to enable chat.
      </div>
    </div>
  )
}

