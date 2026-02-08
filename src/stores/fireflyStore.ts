import { create } from 'zustand'
import { useFeedingStore } from './feedingStore'
import { JAR } from '../constants'

type JarPhase = 'idle' | 'scooping'

interface FireflyState {
  jarCount: number
  phase: JarPhase
  dragX: number
  dragY: number
  pressing: boolean
  coolingDown: boolean
  toggleJar: (x?: number, y?: number) => void
  startScoop: (x: number, y: number) => void
  updateDrag: (x: number, y: number) => void
  endScoop: () => void
  addCatch: () => void
  deliverGift: () => number
  reset: () => void
}

export const useFireflyStore = create<FireflyState>()((set, get) => ({
  jarCount: 0,
  phase: 'idle',
  dragX: 0,
  dragY: 0,
  pressing: false,
  coolingDown: false,

  toggleJar: (x?: number, y?: number) => {
    const { phase, coolingDown } = get()
    if (coolingDown) return
    if (useFeedingStore.getState().isDragging) return
    if (phase === 'idle') {
      set({ phase: 'scooping', pressing: false, dragX: x ?? 0, dragY: y ?? 0 })
    } else {
      set({ phase: 'idle', pressing: false })
    }
  },

  startScoop: (x, y) => {
    if (get().phase !== 'scooping') return
    set({ pressing: true, dragX: x, dragY: y })
  },

  updateDrag: (x, y) => {
    if (get().phase !== 'scooping') return
    set({ dragX: x, dragY: y })
  },

  endScoop: () => {
    set({ pressing: false })
  },

  addCatch: () => set((s) => ({ jarCount: s.jarCount + 1 })),

  deliverGift: () => {
    const count = get().jarCount
    set({ jarCount: 0, phase: 'idle', pressing: false, coolingDown: true })
    setTimeout(() => set({ coolingDown: false }), JAR.cooldownMs)
    return count
  },

  reset: () => set({
    jarCount: 0,
    phase: 'idle',
    dragX: 0,
    dragY: 0,
    pressing: false,
    coolingDown: false,
  }),
}))
