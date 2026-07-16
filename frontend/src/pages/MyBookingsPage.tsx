import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { deleteBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import { useMyBookings } from '../hooks/useMyBookings'
import { formatDateTime, formatPrice } from '../lib/dates'
import SportBadge from '../components/SportBadge'

export default function MyBookingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: bookings, isLoading, isError } = useMyBookings()
  const [feedback, setFeedback] = useState<string | null>(null)

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => {
      setFeedback(t('booking.cancelled'))
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  const confirmed = (bookings ?? []).filter((b) => b.status === 'CONFIRMED')
  const cancelled = (bookings ?? []).filter((b) => b.status === 'CANCELLED')

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('booking.title')}</h1>
      </div>

      {feedback && (
        <div className="alert" role="status">
          {feedback}
          <button className="alert-close" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      {isLoading && <p className="muted">{t('booking.loading')}</p>}
      {isError && <p className="text-danger">{t('booking.loadError')}</p>}

      {!isLoading && !isError && confirmed.length === 0 && (
        <div className="empty-state card">
          <h3>{t('booking.emptyTitle')}</h3>
          <p className="muted">
            {t('booking.emptyBody')}{' '}
            <Link to="/">{t('booking.viewTrainings')}</Link>.
          </p>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="booking-list">
          {confirmed.map((b) => (
            <article key={b.id} className="card booking-row">
              <div className="booking-main">
                {b.training ? (
                  <>
                    <div className="booking-head">
                      <SportBadge sport={b.training.sport} />
                      <Link
                        to={`/trainingen/${b.training.id}`}
                        className="booking-title"
                      >
                        {b.training.title}
                      </Link>
                    </div>
                    <ul className="meta-list compact">
                      <li>🕒 {formatDateTime(b.training.startTime)}</li>
                      <li>📍 {b.training.location}</li>
                      <li>💶 {formatPrice(b.training.price)}</li>
                    </ul>
                  </>
                ) : (
                  <span className="muted">
                    {t('booking.trainingRef', { id: b.trainingId })}
                  </span>
                )}
              </div>
              <div className="booking-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => cancelMutation.mutate(b.id)}
                  disabled={cancelMutation.isPending}
                >
                  {t('booking.cancel')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {cancelled.length > 0 && (
        <>
          <h2 className="section-title muted">
            {t('booking.cancelledSection')}
          </h2>
          <div className="booking-list">
            {cancelled.map((b) => (
              <article key={b.id} className="card booking-row is-cancelled">
                <div className="booking-main">
                  {b.training ? (
                    <>
                      <div className="booking-head">
                        <SportBadge sport={b.training.sport} />
                        <span className="booking-title">{b.training.title}</span>
                      </div>
                      <ul className="meta-list compact">
                        <li>🕒 {formatDateTime(b.training.startTime)}</li>
                      </ul>
                    </>
                  ) : (
                    <span className="muted">
                      {t('booking.trainingRef', { id: b.trainingId })}
                    </span>
                  )}
                </div>
                <span className="status-chip cancelled">
                  {t('booking.cancelledChip')}
                </span>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
