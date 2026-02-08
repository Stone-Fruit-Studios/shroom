// Lightweight shared ref for mushroom world position (updated every frame by Mushroom.tsx)
// Not a Zustand store — no React reactivity needed, just frame-sync reads
export const mushroomWorldPos = { x: 0, y: 0, screenX: 0, screenY: 0 }
