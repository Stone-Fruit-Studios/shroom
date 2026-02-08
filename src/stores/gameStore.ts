import { create } from 'zustand'
import { useMushroomStore } from './mushroomStore'
import { useFeedingStore } from './feedingStore'
import { useFireflyStore } from './fireflyStore'

export type GamePhase = 'playing' | 'gameOver'

const BEST_TIME_KEY = 'shroom-best-survival-time'

function loadBestTime(): number {
  try { return parseFloat(localStorage.getItem(BEST_TIME_KEY) ?? '0') || 0 }
  catch { return 0 }
}

interface GameState {
  phase: GamePhase
  paused: boolean
  survivalTime: number
  bestSurvivalTime: number
  setPaused: (paused: boolean) => void
  tickSurvival: (dt: number) => void
  triggerGameOver: () => void
  restart: () => void
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'playing',
  paused: false,
  survivalTime: 0,
  bestSurvivalTime: loadBestTime(),

  setPaused: (paused) => set({ paused }),

  tickSurvival: (dt) => set((s) => ({ survivalTime: s.survivalTime + dt })),

  triggerGameOver: () => {
    const { survivalTime, bestSurvivalTime } = get()
    const newBest = Math.max(survivalTime, bestSurvivalTime)
    try { localStorage.setItem(BEST_TIME_KEY, String(newBest)) } catch {}
    set({ phase: 'gameOver', bestSurvivalTime: newBest })
  },

  restart: () => {
    useMushroomStore.getState().reset()
    useFeedingStore.getState().reset()
    useFireflyStore.getState().reset()
    set({ phase: 'playing', survivalTime: 0 })
  },
}))
