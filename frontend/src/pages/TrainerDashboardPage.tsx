import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { deleteTraining, getMyTrainings } from '../api/trainings'
import { getErrorMessage } from '../api/client'
import type { Training } from '../api/types'
import { formatDate, formatTimeRange, formatPrice } from '../lib/dates'
import SportBadge from '../components/SportBadge'
import { useToast } from '../components/ToastProvider'

export default function TrainerDashboardPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const {
    data: trainings,
    isLoading,
    isError,
  } = useQuery<Training[]>({
    queryKey: ['trainings', 'mine'],
    queryFn: getMyTrainings,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTraining(id),
    onSuccess: () => {
      showToast(t('trainer.deleted'))
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('trainer.title')}</h1>
        <Link to="/trainer/trainingen/nieuw" className="btn btn-primary">
          {t('trainer.newTraining')}
        </Link>
      </div>

      <section className="dashboard-list">
        <h2>{t('trainer.myTrainings')}</h2>
        {isLoading && <p className="muted">{t('trainer.loading')}</p>}
        {isError && <p className="text-danger">{t('trainer.loadError')}</p>}
        {!isLoading && trainings && trainings.length === 0 && (
          <div className="empty-state card">
            <p className="muted">{t('trainer.emptyBody')}</p>
          </div>
        )}
        {trainings && trainings.length > 0 && (
          <div className="booking-list">
            {trainings.map((tr) => (
              <article key={tr.id} className="card booking-row">
                <div className="booking-main">
                  <div className="booking-head">
                    <SportBadge sport={tr.sport} />
                    <span className="booking-title">{tr.title}</span>
                  </div>
                  <ul className="meta-list compact">
                    <li>
                      🕒 {formatDate(tr.startTime)},{' '}
                      {formatTimeRange(tr.startTime, tr.endTime)}
                    </li>
                    <li>
                      📍{' '}
                      {[tr.location, tr.neighborhood, tr.city]
                        .filter(Boolean)
                        .join(', ')}
                    </li>
                    <li>
                      👥{' '}
                      {t('trainer.bookedCount', {
                        booked: tr.bookingsCount,
                        capacity: tr.capacity,
                      })}
                    </li>
                    <li>💶 {formatPrice(tr.price)}</li>
                  </ul>
                </div>
                <div className="booking-actions">
                  <Link
                    to={`/trainer/trainingen/${tr.id}/bewerken`}
                    className="btn btn-ghost"
                  >
                    {t('trainer.edit')}
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          t('trainer.confirmDelete', { title: tr.title }),
                        )
                      ) {
                        deleteMutation.mutate(tr.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {t('trainer.delete')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
