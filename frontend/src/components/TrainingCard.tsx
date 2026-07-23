import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Training } from '../api/types'
import { formatDateTime, formatPrice } from '../lib/dates'
import { isPopular } from '../lib/popularity'
import SportBadge from './SportBadge'
import StarRating from './StarRating'
import Avatar from './Avatar'

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
  const navigate = useNavigate()
  const isFull = training.availableSpots <= 0
  const isPast = new Date(training.startTime).getTime() < Date.now()
  const popular = isPopular(training)
  // Toon de teacher (de trainer die de les daadwerkelijk geeft) als die is
  // gekozen; anders is de aanmaker impliciet de teacher.
  const presenter = training.teacher ?? training.trainer

  // Navigate to the detail page when the card is clicked, unless the click
  // originated from an interactive control (button or link) inside the card.
  function handleCardClick(e: MouseEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest('button, a')) return
    navigate(`/trainingen/${training.id}`)
  }

  return (
    <article className="card training-card" onClick={handleCardClick}>
      <div className="card-head">
        <div className="badge-row">
          <SportBadge sport={training.sport} />
          {popular && (
            <span className="badge badge-popular">
              <span aria-hidden="true">🔥</span> {t('training.popular')}
            </span>
          )}
          {training.freeTrialAvailable && (
            <span className="badge badge-free-trial">
              {t('training.freeTrial')}
            </span>
          )}
        </div>
        <span className="price">{formatPrice(training.price)}</span>
      </div>

      <h3 className="card-title">
        <Link to={`/trainingen/${training.id}`}>{training.title}</Link>
      </h3>

      {typeof training.rating === 'number' && training.rating > 0 && (
        <div className="card-rating">
          <StarRating
            rating={training.rating}
            count={training.reviewsCount}
            showValue
          />
        </div>
      )}

      <ul className="meta-list">
        <li>
          <span className="meta-icon">🕒</span>
          {formatDateTime(training.startTime)}
        </li>
        <li>
          <span className="meta-icon">📍</span>
          {[training.location, training.neighborhood, training.city]
            .filter(Boolean)
            .join(', ')}
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

      <div className="trainer-row">
        <Avatar src={presenter?.avatarUrl} name={presenter?.name ?? '?'} size={36} />
        <span className="trainer-name">
          {t('training.withTrainer', {
            name: presenter?.name ?? t('training.unknownTrainer'),
          })}
        </span>
      </div>

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
        {booking
          ? t('common.busy')
          : training.freeTrialAvailable
            ? t('training.bookFreeTrial')
            : t('training.book')}
      </button>
    )
  }
}
