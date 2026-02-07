import { insertCoin, onPlayerJoin, type PlayerState } from 'playroomkit'

export async function initPlayroom() {
  await insertCoin({ discord: true })
}

export function onJoin(callback: (state: PlayerState) => void) {
  onPlayerJoin(callback)
}
