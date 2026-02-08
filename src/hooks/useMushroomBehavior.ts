import { useEffect } from 'react'
import { useMushroomStore } from '../stores/mushroomStore'
import { useGameStore } from '../stores/gameStore'
import { conversationManager } from '../ai/conversationManager'
import { BEHAVIOR } from '../constants'

export function useMushroomBehavior() {
  useEffect(() => {
    const interval = setInterval(() => {
      const gameState = useGameStore.getState()
      if (gameState.phase !== 'playing' || gameState.paused) return

      const { hunger, boredom, thirst, evolution, isConversing, receiveMessage, stage } =
        useMushroomStore.getState()

      const message = conversationManager.update(
        Date.now(), hunger, boredom, thirst, evolution, isConversing, 0, stage,
      )

      if (message) receiveMessage(message)
    }, BEHAVIOR.checkInterval)

    return () => clearInterval(interval)
  }, [])
}
