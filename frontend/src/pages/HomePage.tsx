import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTrainings } from '../api/trainings'
import { createBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Sport, Training } from '../api/types'
import { SPORTS, sportLabel } from '../lib/sports'
import { useAuth } from '../auth/AuthContext'
import { useBookedTrainingIds } from '../hooks/useMyBookings'
import TrainingCard from '../components/TrainingCard'
import AgendaView from '../components/AgendaView'

type ViewMode = 'list' | 'agenda'

export default function HomePage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [sport, setSport] = useState<Sport | ''>('')
  const [view, setView] = useState<ViewMode>('list')
  const [feedback, setFeedback] = useState<string | null>(null)

  const bookedIds = useBookedTrainingIds()

  const {
    data: trainings,
    isLoading,
    isError,
  } = useQuery<Training[]>({
    queryKey: ['trainings', { sport }],
    queryFn: () => getTrainings(sport ? { sport } : {}),
  })

  const bookMutation = useMutation({
    mutationFn: (training: Training) =>
      createBooking({ trainingId: training.id }),
    onSuccess: () => {
      setFeedback(t('home.bookingConfirmed'))
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => setFeedback(getErrorMessage(err)),
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('home.title')}</h1>
          <p className="muted">{t('home.subtitle')}</p>
        </div>
        <div className="view-toggle">
          <button
            className={view === 'list' ? 'toggle active' : 'toggle'}
            onClick={() => setView('list')}
          >
            {t('home.viewList')}
          </button>
          <button
            className={view === 'agenda' ? 'toggle active' : 'toggle'}
            onClick={() => setView('agenda')}
          >
            {t('home.viewAgenda')}
          </button>
        </div>
      </div>

      <div className="filters">
        <label htmlFor="sport-filter" className="filter-label">
          {t('home.sport')}
        </label>
        <select
          id="sport-filter"
          value={sport}
          onChange={(e) => setSport(e.target.value as Sport | '')}
        >
          <option value="">{t('home.allSports')}</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {sportLabel(s, t)}
            </option>
          ))}
        </select>
      </div>

      {feedback && (
        <div className="alert" role="status">
          {feedback}
          <button className="alert-close" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      {isLoading && <p className="muted">{t('home.loadingTrainings')}</p>}
      {isError && <p className="text-danger">{t('home.loadError')}</p>}

      {!isLoading && !isError && trainings && trainings.length === 0 && (
        <div className="empty-state card">
          <h3>{t('home.emptyTitle')}</h3>
          <p className="muted">{t('home.emptyBody')}</p>
        </div>
      )}

      {!isLoading && !isError && trainings && trainings.length > 0 && (
        <>
          {view === 'agenda' ? (
            <AgendaView trainings={trainings} />
          ) : (
            <div className="card-grid">
              {trainings.map((t) => (
                <TrainingCard
                  key={t.id}
                  training={t}
                  isAuthenticated={isAuthenticated}
                  isBooked={bookedIds.has(t.id)}
                  onBook={(tr) => bookMutation.mutate(tr)}
                  booking={
                    bookMutation.isPending &&
                    bookMutation.variables?.id === t.id
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
