import { Link } from 'react-router-dom'
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
          {training.trainer?.name ?? 'Onbekend'}
        </li>
        <li>
          <span className="meta-icon">👥</span>
          {isFull ? (
            <span className="text-danger">Vol</span>
          ) : (
            <>
              {training.availableSpots} van {training.capacity} plekken vrij
            </>
          )}
        </li>
      </ul>

      <div className="card-actions">
        {renderButton()}
        <Link to={`/trainingen/${training.id}`} className="btn btn-ghost">
          Details
        </Link>
      </div>
    </article>
  )

  function renderButton() {
    if (isBooked) {
      return (
        <button className="btn btn-success" disabled>
          Geboekt
        </button>
      )
    }
    if (isPast) {
      return (
        <button className="btn" disabled>
          Verlopen
        </button>
      )
    }
    if (isFull) {
      return (
        <button className="btn" disabled>
          Vol
        </button>
      )
    }
    if (!isAuthenticated) {
      return (
        <Link to="/login" className="btn btn-primary">
          Inloggen om te boeken
        </Link>
      )
    }
    return (
      <button
        className="btn btn-primary"
        onClick={() => onBook?.(training)}
        disabled={booking}
      >
        {booking ? 'Bezig…' : 'Boek'}
      </button>
    )
  }
}
