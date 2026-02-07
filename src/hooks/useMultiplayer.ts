import { useEffect, useState } from 'react'
import { initDiscord } from '../multiplayer/discord'
import { initPlayroom } from '../multiplayer/playroom'

export function useMultiplayer() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await initDiscord()
        await initPlayroom()
        setReady(true)
      } catch (err) {
        console.error('Multiplayer init failed:', err)
      }
    }
    init()
  }, [])

  return { ready }
}
