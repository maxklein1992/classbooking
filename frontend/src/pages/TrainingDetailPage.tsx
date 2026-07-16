import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTraining } from '../api/trainings'
import { createBooking, deleteBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Booking, Training } from '../api/types'
import { formatDateTime, formatPrice, formatTimeRange } from '../lib/dates'
import { useAuth } from '../auth/AuthContext'
import { useMyBookings } from '../hooks/useMyBookings'
import SportBadge from '../components/SportBadge'

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
            <span>{training.location}</span>
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
