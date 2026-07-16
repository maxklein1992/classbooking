import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Training } from '../api/types'
import { formatDateTime, formatPrice } from '../lib/dates'
import SportBadge from './SportBadge'

interface Props {
  training: Training
  isAuthenticated: boolean
  isBooked: boolean
  onBook?: (training: Training) => void
  booking?: boolean
}

export default function TrainingCard({
  training,
  isAuthenticated,
  isBooked,
  onBook,
  booking,
}: Props) {
  const { t } = useTranslation()
  const isFull = training.availableSpots <= 0
  const isPast = new Date(training.startTime).getTime() < Date.now()

  return (
    <article className="card training-card">
      <div className="card-head">
        <SportBadge sport={training.sport} />
        <span className="price">{formatPrice(training.price)}</span>
      </div>

      <h3 className="card-title">
        <Link to={`/trainingen/${training.id}`}>{training.title}</Link>
      </h3>

      <ul className="meta-list">
        <li>
          <span className="meta-icon">🕒</span>
          {formatDateTime(training.startTime)}
        </li>
        <li>
          <span className="meta-icon">📍</span>
          {training.location}
        </li>
        <li>
          <span className="meta-icon">🧑‍🏫</span>
          {training.trainer?.name ?? t('training.unknownTrainer')}
        </li>
        <li>
          <span className="meta-icon">👥</span>
          {isFull ? (
            <span className="text-danger">{t('training.full')}</span>
          ) : (
            <>
              {t('training.spotsFree', {
                spots: training.availableSpots,
                capacity: training.capacity,
              })}
            </>
          )}
        </li>
      </ul>

      <div className="card-actions">
        {renderButton()}
        <Link to={`/trainingen/${training.id}`} className="btn btn-ghost">
          {t('common.details')}
        </Link>
      </div>
    </article>
  )

  function renderButton() {
    if (isBooked) {
      return (
        <button className="btn btn-success" disabled>
          {t('training.booked')}
        </button>
      )
    }
    if (isPast) {
      return (
        <button className="btn" disabled>
          {t('training.expired')}
        </button>
      )
    }
    if (isFull) {
      return (
        <button className="btn" disabled>
          {t('training.full')}
        </button>
      )
    }
    if (!isAuthenticated) {
      return (
        <Link to="/login" className="btn btn-primary">
          {t('training.loginToBook')}
        </Link>
      )
    }
    return (
      <button
        className="btn btn-primary"
        onClick={() => onBook?.(training)}
        disabled={booking}
      >
        {booking ? t('common.busy') : t('training.book')}
      </button>
    )
  }
}
