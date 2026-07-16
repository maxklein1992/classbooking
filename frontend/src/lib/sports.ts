import type { Sport } from '../api/types'

export const SPORT_LABELS: Record<Sport, string> = {
  BOXING: 'Boksen',
  FOOTVOLLEY: 'Footvolley',
  YOGA: 'Yoga',
  HIIT: 'HIIT',
  SPINNING: 'Spinning',
  OTHER: 'Overig',
}

export const SPORTS: Sport[] = [
  'BOXING',
  'FOOTVOLLEY',
  'YOGA',
  'HIIT',
  'SPINNING',
  'OTHER',
]

export function sportLabel(sport: Sport): string {
  return SPORT_LABELS[sport] ?? sport
}
