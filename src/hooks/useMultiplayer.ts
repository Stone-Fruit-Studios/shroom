import { useEffect, useState } from 'react'
import { initPlayroom, getMyProfile } from '../multiplayer/playroom'
import { initDiscordSdk } from '../multiplayer/discord'
import { usePlayerStore } from '../stores/playerStore'

const DISCORD_ENABLED = import.meta.env.VITE_PLAYROOM_DISCORD_ENABLED === 'true'
const HAS_GAME_ID = !!import.meta.env.VITE_PLAYROOM_GAME_ID

export function useMultiplayer() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      // Skip all Playroom/Discord init for local dev
      if (!HAS_GAME_ID && !DISCORD_ENABLED) {
        setReady(true)
        return
      }

      try {
        await initPlayroom()

        // After Playroom init, grab the Discord SDK and player profile
        if (DISCORD_ENABLED) {
          initDiscordSdk()
        }

        const profile = getMyProfile()
        if (profile?.name) {
          usePlayerStore.getState().setPlayer(profile.name, profile.photo || '')
        }

        setReady(true)
      } catch (err) {
        console.error('Multiplayer init failed:', err)
        // Still let the game run even if init fails
        setReady(true)
      }
    }
    init()
  }, [])

  return { ready }
}
