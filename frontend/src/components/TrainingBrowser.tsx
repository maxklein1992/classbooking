import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTrainings } from '../api/trainings'
import { createBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Training, TrainingsQuery } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useBookedTrainingIds } from '../hooks/useMyBookings'
import TrainingCard from './TrainingCard'
import AgendaView from './AgendaView'

type ViewMode = 'list' | 'agenda'

interface Props {
  /** Query passed to the trainings API. */
  query?: TrainingsQuery
  /** Place shown in the heading ("Classes near <place>"); falls back to "near you". */
  place?: string | null
}

export default function TrainingBrowser({ query = {}, place }: Props) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [view, setView] = useState<ViewMode>('list')
  const [feedback, setFeedback] = useState<string | null>(null)

  const bookedIds = useBookedTrainingIds()

  const {
    data: trainings,
    isLoading,
    isError,
  } = useQuery<Training[]>({
    queryKey: ['trainings', query],
    queryFn: () => getTrainings(query),
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
    <>
      <div className="page-header">
        <h2 className="list-heading">
          {place ? t('home.nearHeading', { place }) : t('home.nearYou')}
        </h2>
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
              {trainings.map((tr) => (
                <TrainingCard
                  key={tr.id}
                  training={tr}
                  isAuthenticated={isAuthenticated}
                  isBooked={bookedIds.has(tr.id)}
                  onBook={(x) => bookMutation.mutate(x)}
                  booking={
                    bookMutation.isPending && bookMutation.variables?.id === tr.id
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
