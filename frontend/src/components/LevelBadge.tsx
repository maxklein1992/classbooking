import { useTranslation } from 'react-i18next'
import type { Level } from '../api/types'
import { levelLabel } from '../lib/levels'

const LEVEL_CLASS: Record<Level, string> = {
  BEGINNER: 'badge-beginner',
  INTERMEDIATE: 'badge-intermediate',
  ADVANCED: 'badge-advanced',
}

export default function LevelBadge({ level }: { level: Level }) {
  const { t } = useTranslation()
  return (
    <span className={`badge ${LEVEL_CLASS[level] ?? 'badge-other'}`}>
      {levelLabel(level, t)}
    </span>
  )
}
