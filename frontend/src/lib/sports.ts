import type { TFunction } from 'i18next'
import type { Sport } from '../api/types'

export const SPORTS: Sport[] = [
  'BOXING',
  'FOOTVOLLEY',
  'YOGA',
  'HIIT',
  'SPINNING',
  'OTHER',
]

// Localized display name for a sport. Pass the `t` from useTranslation so the
// label re-renders when the active language changes.
export function sportLabel(sport: Sport, t: TFunction): string {
  return t(`sports.${sport}`)
}
