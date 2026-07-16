import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTraining } from '../api/trainings'
import { createBooking, deleteBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Booking, Training } from '../api/types'
import { formatDateTime, formatPrice, formatTimeRange } from '../lib/dates'
import { useAuth } from '../auth/AuthContext'
import { useMyBookings } from '../hooks/useMyBookings'
import SportBadge from '../components/SportBadge'

export default function TrainingDetailPage() {
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
      setFeedback('Je boeking is bevestigd!')
      invalidate()
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => {
      setFeedback('Je boeking is geannuleerd.')
      invalidate()
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['training', id] })
    queryClient.invalidateQueries({ queryKey: ['trainings'] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  if (isLoading) return <div className="page muted">Training laden…</div>
  if (isError || !training)
    return (
      <div className="page">
        <p className="text-danger">Training niet gevonden.</p>
        <Link to="/" className="btn btn-ghost">
          ← Terug naar overzicht
        </Link>
      </div>
    )

  const isFull = training.availableSpots <= 0
  const isPast = new Date(training.startTime).getTime() < Date.now()

  return (
    <div className="page detail-page">
      <Link to="/" className="back-link">
        ← Terug naar overzicht
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
            <span className="detail-label">Datum</span>
            <span>{formatDateTime(training.startTime)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tijd</span>
            <span>{formatTimeRange(training.startTime, training.endTime)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Locatie</span>
            <span>{training.location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Trainer</span>
            <span>{training.trainer?.name ?? 'Onbekend'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Beschikbaarheid</span>
            <span>
              {isFull ? (
                <span className="text-danger">Vol</span>
              ) : (
                `${training.availableSpots} van ${training.capacity} plekken vrij`
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
          Inloggen om te boeken
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
          {cancelMutation.isPending ? 'Bezig…' : 'Boeking annuleren'}
        </button>
      )
    }
    if (isPast) {
      return (
        <button className="btn btn-lg" disabled>
          Deze training is verlopen
        </button>
      )
    }
    if (isFull) {
      return (
        <button className="btn btn-lg" disabled>
          Vol
        </button>
      )
    }
    return (
      <button
        className="btn btn-primary btn-lg"
        onClick={() => bookMutation.mutate()}
        disabled={bookMutation.isPending}
      >
        {bookMutation.isPending ? 'Bezig…' : 'Boek deze training'}
      </button>
    )
  }
}
