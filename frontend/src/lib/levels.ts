import type { TFunction } from 'i18next'
import type { Level } from '../api/types'

export const LEVELS: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

// Localized display name for a level. Pass the `t` from useTranslation so the
// label re-renders when the active language changes.
export function levelLabel(level: Level, t: TFunction): string {
  return t(`levels.${level}`)
}
