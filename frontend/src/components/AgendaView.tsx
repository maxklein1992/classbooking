import { useMemo, useState } from 'react'
import {
  addDays,
  isSameDay,
  startOfWeek,
  format,
  isWithinInterval,
  endOfDay,
  startOfDay,
} from 'date-fns'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Training } from '../api/types'
import { currentLocale, formatTimeRange } from '../lib/dates'
import SportBadge from './SportBadge'

interface Props {
  trainings: Training[]
}

// A dependency-light weekly agenda. Groups trainings per day (Mon-Sun) and
// lets the user page between weeks.
export default function AgendaView({ trainings }: Props) {
  const { t } = useTranslation()
  const [weekOffset, setWeekOffset] = useState(0)

  // useTranslation re-renders this component on language change, so reading the
  // active date-fns locale here keeps day/month names in the current language.
  const locale = currentLocale()

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 })
    return addDays(base, weekOffset * 7)
  }, [weekOffset])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const weekEnd = endOfDay(addDays(weekStart, 6))

  const byDay = useMemo(() => {
    const map = new Map<string, Training[]>()
    for (const day of days) map.set(day.toDateString(), [])
    for (const tr of trainings) {
      const start = new Date(tr.startTime)
      if (
        isWithinInterval(start, { start: startOfDay(weekStart), end: weekEnd })
      ) {
        const key = start.toDateString()
        const list = map.get(key)
        if (list) list.push(tr)
      }
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
    }
    return map
  }, [days, trainings, weekStart, weekEnd])

  const rangeLabel = `${format(weekStart, 'd MMM', { locale })} – ${format(
    addDays(weekStart, 6),
    'd MMM yyyy',
    { locale },
  )}`

  return (
    <div className="agenda">
      <div className="agenda-toolbar">
        <button
          className="btn btn-ghost"
          onClick={() => setWeekOffset((v) => v - 1)}
        >
          {t('agenda.prevWeek')}
        </button>
        <div className="agenda-range">
          <strong>{rangeLabel}</strong>
          {weekOffset !== 0 && (
            <button className="link-btn" onClick={() => setWeekOffset(0)}>
              {t('agenda.thisWeek')}
            </button>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setWeekOffset((v) => v + 1)}
        >
          {t('agenda.nextWeek')}
        </button>
      </div>

      <div className="agenda-grid">
        {days.map((day) => {
          const items = byDay.get(day.toDateString()) ?? []
          const today = isSameDay(day, new Date())
          return (
            <div
              key={day.toISOString()}
              className={`agenda-col${today ? ' is-today' : ''}`}
            >
              <div className="agenda-day-head">
                <span className="agenda-dow">
                  {format(day, 'EEEE', { locale })}
                </span>
                <span className="agenda-date">
                  {format(day, 'd MMM', { locale })}
                </span>
              </div>
              <div className="agenda-items">
                {items.length === 0 ? (
                  <p className="agenda-empty">—</p>
                ) : (
                  items.map((tr) => (
                    <Link
                      to={`/trainingen/${tr.id}`}
                      key={tr.id}
                      className="agenda-item"
                    >
                      <span className="agenda-time">
                        {formatTimeRange(tr.startTime, tr.endTime)}
                      </span>
                      <span className="agenda-item-title">{tr.title}</span>
                      <SportBadge sport={tr.sport} />
                      <span className="agenda-spots">
                        {tr.availableSpots > 0
                          ? t('training.freeShort', { spots: tr.availableSpots })
                          : t('training.full')}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
