import { STAGE_THRESHOLDS } from './constants'

type DevMode = 'fast' | 'tutorial' | null

const raw = import.meta.env.VITE_DEV_MODE as string | undefined
export const DEV_MODE: DevMode =
  raw === 'fast' ? 'fast' : raw === 'tutorial' ? 'tutorial' : null

export const DEV = {
  statRateMultiplier: DEV_MODE === 'fast' ? 10 : DEV_MODE === 'tutorial' ? 0.2 : 1,
  feedsToStage2: DEV_MODE === 'fast' ? 1 : STAGE_THRESHOLDS.feedsToStage2,
  mistsToStage3: DEV_MODE === 'fast' ? 2 : STAGE_THRESHOLDS.mistsToStage3,
} as const
