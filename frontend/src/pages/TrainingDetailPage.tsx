import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTraining } from '../api/trainings'
import { createBooking, deleteBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Booking, Training } from '../api/types'
import { formatDate, formatDateTime, formatPrice, formatTimeRange } from '../lib/dates'
import { useAuth } from '../auth/AuthContext'
import { useMyBookings } from '../hooks/useMyBookings'
import SportBadge from '../components/SportBadge'
import StarRating from '../components/StarRating'
import Avatar from '../components/Avatar'

export default function TrainingDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)

  const {
    data: training,
    isLoading,
    isError,
  } = useQuery<Training>({
    queryKey: ['training', id],
    queryFn: () => getTraining(id),
    enabled: !!id,
  })

  const { data: myBookings } = useMyBookings()
  const activeBooking: Booking | undefined = myBookings?.find(
    (b) => b.trainingId === id && b.status === 'CONFIRMED',
  )

  const bookMutation = useMutation({
    mutationFn: () => createBooking({ trainingId: id }),
    onSuccess: () => {
      setFeedback(t('home.bookingConfirmed'))
      invalidate()
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => {
      setFeedback(t('training.bookingCancelled'))
      invalidate()
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['training', id] })
    queryClient.invalidateQueries({ queryKey: ['trainings'] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  if (isLoading)
    return <div className="page muted">{t('home.loadingTrainings')}</div>
  if (isError || !training)
    return (
      <div className="page">
        <p className="text-danger">{t('training.notFound')}</p>
        <Link to="/" className="btn btn-ghost">
          {t('common.back')}
        </Link>
      </div>
    )

  const isFull = training.availableSpots <= 0
  const isPast = new Date(training.startTime).getTime() < Date.now()

  return (
    <div className="page detail-page">
      <Link to="/" className="back-link">
        {t('common.back')}
      </Link>

      <div className="card detail-card">
        <div className="card-head">
          <SportBadge sport={training.sport} />
          <span className="price">{formatPrice(training.price)}</span>
        </div>

        <h1>{training.title}</h1>
        {typeof training.rating === 'number' && training.rating > 0 && (
          <div className="detail-rating">
            <StarRating
              rating={training.rating}
              count={training.reviewsCount}
              size={18}
              showValue
            />
          </div>
        )}
        <p className="detail-desc">{training.description}</p>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">{t('training.date')}</span>
            <span>{formatDateTime(training.startTime)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('training.time')}</span>
            <span>{formatTimeRange(training.startTime, training.endTime)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('training.location')}</span>
            <span>
              {[
                training.location,
                training.neighborhood,
                [training.postalCode, training.city]
                  .filter(Boolean)
                  .join(' '),
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('training.trainer')}</span>
            <span>{training.trainer?.name ?? t('training.unknownTrainer')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t('training.availability')}</span>
            <span>
              {isFull ? (
                <span className="text-danger">{t('training.full')}</span>
              ) : (
                t('training.spotsFree', {
                  spots: training.availableSpots,
                  capacity: training.capacity,
                })
              )}
            </span>
          </div>
        </div>

        {feedback && (
          <div className="alert" role="status">
            {feedback}
            <button className="alert-close" onClick={() => setFeedback(null)}>
              ×
            </button>
          </div>
        )}

        <div className="detail-actions">{renderAction()}</div>
      </div>

      {training.trainer?.bio && (
        <section className="card trainer-card">
          <h2>{t('training.aboutTrainer')}</h2>
          <div className="trainer-profile">
            <Avatar
              src={training.trainer.avatarUrl}
              name={training.trainer.name}
              size={72}
            />
            <div>
              <div className="trainer-profile-name">{training.trainer.name}</div>
              <p className="muted">{training.trainer.bio}</p>
            </div>
          </div>
        </section>
      )}

      <section className="card reviews-card">
        <div className="reviews-head">
          <h2>{t('training.reviews')}</h2>
          {training.reviewsCount ? (
            <StarRating
              rating={training.rating ?? 0}
              count={training.reviewsCount}
              showValue
            />
          ) : null}
        </div>
        {training.reviews && training.reviews.length > 0 ? (
          <ul className="review-list">
            {training.reviews.map((r) => (
              <li key={r.id} className="review">
                <Avatar src={r.avatarUrl} name={r.author} size={44} />
                <div className="review-body">
                  <div className="review-top">
                    <span className="review-author">{r.author}</span>
                    <span className="review-date">{formatDate(r.date)}</span>
                  </div>
                  <StarRating rating={r.rating} size={13} />
                  <p className="review-comment">{r.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t('training.noReviews')}</p>
        )}
      </section>
    </div>
  )

  function renderAction() {
    if (!isAuthenticated) {
      return (
        <Link to="/login" className="btn btn-primary btn-lg">
          {t('training.loginToBook')}
        </Link>
      )
    }
    if (activeBooking) {
      return (
        <button
          className="btn btn-danger btn-lg"
          onClick={() => cancelMutation.mutate(activeBooking.id)}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending
            ? t('common.busy')
            : t('training.cancelBooking')}
        </button>
      )
    }
    if (isPast) {
      return (
        <button className="btn btn-lg" disabled>
          {t('training.expiredLong')}
        </button>
      )
    }
    if (isFull) {
      return (
        <button className="btn btn-lg" disabled>
          {t('training.full')}
        </button>
      )
    }
    return (
      <button
        className="btn btn-primary btn-lg"
        onClick={() => bookMutation.mutate()}
        disabled={bookMutation.isPending}
      >
        {bookMutation.isPending ? t('common.busy') : t('training.bookThis')}
      </button>
    )
  }
}
