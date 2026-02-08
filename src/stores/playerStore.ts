import { create } from 'zustand'

interface PlayerState {
  playerName: string | null
  playerAvatar: string | null
  setPlayer: (name: string, avatar: string) => void
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  playerName: null,
  playerAvatar: null,
  setPlayer: (name, avatar) => set({ playerName: name, playerAvatar: avatar }),
}))
