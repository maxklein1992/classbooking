import { useRef, useState, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTraining, getTrainings } from '../api/trainings'
import { createBooking, deleteBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import type { Booking, Training, TrainerRef } from '../api/types'
import { formatDate, formatDateTime, formatPrice, formatTimeRange } from '../lib/dates'
import { useAuth } from '../auth/AuthContext'
import { useMyBookings } from '../hooks/useMyBookings'
import SportBadge from '../components/SportBadge'
import LevelBadge from '../components/LevelBadge'
import StarRating from '../components/StarRating'
import Avatar from '../components/Avatar'
import AgendaView from '../components/AgendaView'
import PhotoCarousel from '../components/PhotoCarousel'

const TABS = ['overview', 'groups', 'team', 'reviews'] as const
type Tab = (typeof TABS)[number]

/**
 * Team-lijst afgeleid van trainer + (optionele) teacher, voor trainingen
 * zonder expliciete `team` (mock-only veld). Toont de teacher apart van de
 * aanmaker/eigenaar (trainer) wanneer die verschillen.
 */
function buildTeamFromTrainerAndTeacher(
  training: Training,
  t: (key: string) => string,
): TrainerRef[] {
  const members: TrainerRef[] = [
    { ...training.trainer, role: t('detail.roleTrainer') },
  ]
  if (training.teacher && training.teacher.id !== training.trainerId) {
    members.push({ ...training.teacher, role: t('detail.roleTeacher') })
  }
  return members
}

export default function TrainingDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const {
    data: training,
    isLoading,
    isError,
  } = useQuery<Training>({
    queryKey: ['training', id],
    queryFn: () => getTraining(id),
    enabled: !!id,
  })

  // Alle trainingen — gebruikt om de groepslessen (zelfde sport) in de agenda
  // te tonen op de "Groepslessen"-tab.
  const { data: allTrainings } = useQuery<Training[]>({
    queryKey: ['trainings', {}],
    queryFn: () => getTrainings({}),
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

  // Toetsenbordbediening voor de tabs (pijltjes + Home/End).
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    else return
    e.preventDefault()
    setTab(TABS[next])
    tabRefs.current[next]?.focus()
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
  const photos = training.photos ?? []
  const team = training.team ?? buildTeamFromTrainerAndTeacher(training, t)
  const groupClasses =
    allTrainings?.filter((x) => x.sport === training.sport) ?? []

  return (
    <div className="page detail-page">
      <Link to="/" className="back-link">
        {t('common.back')}
      </Link>

      <PhotoCarousel photos={photos} title={training.title} />

      <div className="card detail-card">
        <div className="card-head">
          <div className="badge-row">
            <SportBadge sport={training.sport} />
            {training.level && <LevelBadge level={training.level} />}
            {training.freeTrialAvailable && (
              <span className="badge badge-free-trial">
                {t('training.freeTrial')}
              </span>
            )}
          </div>
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

      <div className="tabs">
        <div className="tablist" role="tablist" aria-label={t('detail.tabsLabel')}>
          {TABS.map((tb, i) => (
            <button
              key={tb}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              id={`tab-${tb}`}
              aria-selected={tab === tb}
              aria-controls={`panel-${tb}`}
              tabIndex={tab === tb ? 0 : -1}
              className={tab === tb ? 'tab active' : 'tab'}
              onClick={() => setTab(tb)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
            >
              {t(`detail.tabs.${tb}`)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <section
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="tabpanel card"
          >
            <p className="detail-desc">{training.description}</p>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">{t('training.date')}</span>
                <span>{formatDateTime(training.startTime)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t('training.time')}</span>
                <span>
                  {formatTimeRange(training.startTime, training.endTime)}
                </span>
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
              <div className="detail-item">
                <span className="detail-label">{t('training.teacher')}</span>
                <span>{training.teacher?.name ?? training.trainer.name}</span>
              </div>
            </div>

            {training.trainer?.bio && (
              <div className="trainer-profile">
                <Avatar
                  src={training.trainer.avatarUrl}
                  name={training.trainer.name}
                  size={64}
                />
                <div>
                  <div className="trainer-profile-name">
                    {training.trainer.name}
                  </div>
                  <p className="muted">{training.trainer.bio}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'groups' && (
          <section
            id="panel-groups"
            role="tabpanel"
            aria-labelledby="tab-groups"
            className="tabpanel"
          >
            {groupClasses.length > 0 ? (
              <AgendaView trainings={groupClasses} />
            ) : (
              <p className="muted">{t('detail.noGroups')}</p>
            )}
          </section>
        )}

        {tab === 'team' && (
          <section
            id="panel-team"
            role="tabpanel"
            aria-labelledby="tab-team"
            className="tabpanel card"
          >
            {team.length > 0 ? (
              <ul className="team-list">
                {team.map((m) => (
                  <li key={m.id} className="team-member">
                    <Avatar src={m.avatarUrl} name={m.name} size={56} />
                    <div>
                      <div className="team-name">{m.name}</div>
                      {m.role && <div className="team-role">{m.role}</div>}
                      {m.bio && <p className="muted">{m.bio}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">{t('detail.noTeam')}</p>
            )}
          </section>
        )}

        {tab === 'reviews' && (
          <section
            id="panel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            className="tabpanel card"
          >
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
        )}
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
