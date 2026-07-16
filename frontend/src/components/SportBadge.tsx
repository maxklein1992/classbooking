import type { Sport } from '../api/types'
import { sportLabel } from '../lib/sports'

const SPORT_CLASS: Record<Sport, string> = {
  BOXING: 'badge-boxing',
  FOOTVOLLEY: 'badge-footvolley',
  YOGA: 'badge-yoga',
  HIIT: 'badge-hiit',
  SPINNING: 'badge-spinning',
  OTHER: 'badge-other',
}

export default function SportBadge({ sport }: { sport: Sport }) {
  return (
    <span className={`badge ${SPORT_CLASS[sport] ?? 'badge-other'}`}>
      {sportLabel(sport)}
    </span>
  )
}
