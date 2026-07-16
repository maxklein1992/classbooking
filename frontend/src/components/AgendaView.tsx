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
import { nl } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import type { Training } from '../api/types'
import { formatTimeRange } from '../lib/dates'
import SportBadge from './SportBadge'

interface Props {
  trainings: Training[]
}

// A dependency-light weekly agenda. Groups trainings per day (Mon-Sun) and
// lets the user page between weeks.
export default function AgendaView({ trainings }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)

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
    for (const t of trainings) {
      const start = new Date(t.startTime)
      if (
        isWithinInterval(start, { start: startOfDay(weekStart), end: weekEnd })
      ) {
        const key = start.toDateString()
        const list = map.get(key)
        if (list) list.push(t)
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

  const rangeLabel = `${format(weekStart, 'd MMM', { locale: nl })} – ${format(
    addDays(weekStart, 6),
    'd MMM yyyy',
    { locale: nl },
  )}`

  return (
    <div className="agenda">
      <div className="agenda-toolbar">
        <button className="btn btn-ghost" onClick={() => setWeekOffset((v) => v - 1)}>
          ← Vorige week
        </button>
        <div className="agenda-range">
          <strong>{rangeLabel}</strong>
          {weekOffset !== 0 && (
            <button className="link-btn" onClick={() => setWeekOffset(0)}>
              Deze week
            </button>
          )}
        </div>
        <button className="btn btn-ghost" onClick={() => setWeekOffset((v) => v + 1)}>
          Volgende week →
        </button>
      </div>

      <div className="agenda-grid">
        {days.map((day) => {
          const items = byDay.get(day.toDateString()) ?? []
          const today = isSameDay(day, new Date())
          return (
            <div key={day.toISOString()} className={`agenda-col${today ? ' is-today' : ''}`}>
              <div className="agenda-day-head">
                <span className="agenda-dow">
                  {format(day, 'EEEE', { locale: nl })}
                </span>
                <span className="agenda-date">
                  {format(day, 'd MMM', { locale: nl })}
                </span>
              </div>
              <div className="agenda-items">
                {items.length === 0 ? (
                  <p className="agenda-empty">—</p>
                ) : (
                  items.map((t) => (
                    <Link
                      to={`/trainingen/${t.id}`}
                      key={t.id}
                      className="agenda-item"
                    >
                      <span className="agenda-time">
                        {formatTimeRange(t.startTime, t.endTime)}
                      </span>
                      <span className="agenda-item-title">{t.title}</span>
                      <SportBadge sport={t.sport} />
                      <span className="agenda-spots">
                        {t.availableSpots > 0
                          ? `${t.availableSpots} vrij`
                          : 'Vol'}
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
