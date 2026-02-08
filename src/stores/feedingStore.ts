import { create } from 'zustand'
import type { FoodType, DropRequest } from '../types'
import { FOOD_TYPES } from '../constants'

type CooldownMap = Record<string, boolean>

interface FeedingState {
  isDragging: boolean
  dragFoodType: FoodType | null
  dragX: number
  dragY: number
  dropRequest: DropRequest | null
  cooldowns: CooldownMap
  startDrag: (foodType: FoodType, x: number, y: number) => void
  updateDrag: (x: number, y: number) => void
  endDrag: () => void
  consumeDropRequest: () => DropRequest | null
  recordHit: (foodType: FoodType) => void
  recordMiss: () => void
  reset: () => void
}

export const useFeedingStore = create<FeedingState>()((set, get) => ({
  isDragging: false,
  dragFoodType: null,
  dragX: 0,
  dragY: 0,
  dropRequest: null,
  cooldowns: {} as CooldownMap,

  startDrag: (foodType, x, y) => {
    if (get().isDragging || get().dropRequest || get().cooldowns[foodType]) return
    set({ isDragging: true, dragFoodType: foodType, dragX: x, dragY: y })
  },

  updateDrag: (x, y) => {
    if (!get().isDragging) return
    set({ dragX: x, dragY: y })
  },

  endDrag: () => {
    const { isDragging, dragFoodType, dragX, dragY } = get()
    if (!isDragging || !dragFoodType) return
    set({
      isDragging: false,
      dropRequest: {
        nx: dragX / window.innerWidth,
        ny: dragY / window.innerHeight,
        foodType: dragFoodType,
      },
    })
  },

  consumeDropRequest: () => {
    const req = get().dropRequest
    if (req) set({ dropRequest: null, dragFoodType: null })
    return req
  },

  recordHit: (foodType) => {
    set({ cooldowns: { ...get().cooldowns, [foodType]: true } })
    setTimeout(() => {
      const { [foodType]: _, ...rest } = get().cooldowns
      set({ cooldowns: rest })
    }, FOOD_TYPES[foodType].cooldownMs)
  },

  recordMiss: () => {},

  reset: () => {
    set({
      isDragging: false,
      dragFoodType: null,
      dragX: 0,
      dragY: 0,
      dropRequest: null,
      cooldowns: {} as CooldownMap,
    })
  },
}))
