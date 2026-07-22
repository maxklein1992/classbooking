import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  createTraining,
  deleteTraining,
  getMyTrainings,
  updateTraining,
} from '../api/trainings'
import { getErrorMessage } from '../api/client'
import type { CreateTrainingPayload, Sport, Training } from '../api/types'
import { SPORTS, sportLabel } from '../lib/sports'
import {
  formatDate,
  formatTimeRange,
  formatPrice,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../lib/dates'
import SportBadge from '../components/SportBadge'
import { useToast } from '../components/ToastProvider'

interface FormState {
  title: string
  description: string
  sport: Sport
  startTime: string // datetime-local value
  endTime: string // datetime-local value
  location: string
  city: string
  neighborhood: string
  postalCode: string
  capacity: string
  price: string
  freeTrialAvailable: boolean
}

const emptyForm: FormState = {
  title: '',
  description: '',
  sport: 'BOXING',
  startTime: '',
  endTime: '',
  location: '',
  city: '',
  neighborhood: '',
  postalCode: '',
  capacity: '10',
  price: '0',
  freeTrialAvailable: false,
}

export default function TrainerDashboardPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    data: trainings,
    isLoading,
    isError,
  } = useQuery<Training[]>({
    queryKey: ['trainings', 'mine'],
    queryFn: getMyTrainings,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: CreateTrainingPayload) =>
      editingId
        ? updateTraining(editingId, payload)
        : createTraining(payload),
    onSuccess: () => {
      showToast(editingId ? t('trainer.updated') : t('trainer.created'))
      resetForm()
      invalidate()
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTraining(id),
    onSuccess: () => {
      showToast(t('trainer.deleted'))
      invalidate()
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['trainings'] })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(training: Training) {
    setEditingId(training.id)
    setForm({
      title: training.title,
      description: training.description,
      sport: training.sport,
      startTime: toDatetimeLocalValue(training.startTime),
      endTime: toDatetimeLocalValue(training.endTime),
      location: training.location,
      city: training.city,
      neighborhood: training.neighborhood ?? '',
      postalCode: training.postalCode ?? '',
      capacity: String(training.capacity),
      price: String(training.price),
      freeTrialAvailable: training.freeTrialAvailable ?? false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const start = new Date(form.startTime)
    const end = new Date(form.endTime)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showToast(t('trainer.invalidTimes'), 'error')
      return
    }
    if (end <= start) {
      showToast(t('trainer.endAfterStart'), 'error')
      return
    }
    // Alleen bij het aanmaken (niet bewerken) moet de starttijd in de
    // toekomst liggen, net als de backend-check in trainings.service.ts.
    if (!editingId && start <= new Date()) {
      showToast(t('trainer.startInFuture'), 'error')
      return
    }
    const capacity = Number(form.capacity)
    if (!Number.isFinite(capacity) || capacity < 1) {
      showToast(t('trainer.capacityMin'), 'error')
      return
    }

    const payload: CreateTrainingPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      sport: form.sport,
      startTime: fromDatetimeLocalValue(form.startTime),
      endTime: fromDatetimeLocalValue(form.endTime),
      location: form.location.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined,
      capacity,
      price: Number(form.price) || 0,
      freeTrialAvailable: form.freeTrialAvailable,
    }
    saveMutation.mutate(payload)
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('trainer.title')}</h1>
      </div>

      <div className="dashboard-layout">
        <section className="card form-card">
          <h2>
            {editingId ? t('trainer.editTraining') : t('trainer.newTraining')}
          </h2>
          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>{t('trainer.fieldTitle')}</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{t('trainer.fieldDescription')}</span>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
              />
            </label>
            <label className="field">
              <span>{t('trainer.fieldSport')}</span>
              <select
                value={form.sport}
                onChange={(e) => set('sport', e.target.value as Sport)}
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {sportLabel(s, t)}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-row">
              <label className="field">
                <span>{t('trainer.fieldStart')}</span>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('trainer.fieldEnd')}</span>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>{t('trainer.fieldLocation')}</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>{t('trainer.fieldCity')}</span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('trainer.fieldNeighborhood')}</span>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => set('neighborhood', e.target.value)}
                />
              </label>
            </div>
            <label className="field">
              <span>{t('trainer.fieldPostalCode')}</span>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value)}
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>{t('trainer.fieldCapacity')}</span>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('trainer.fieldPrice')}</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </label>
            </div>

            <label className="field-check">
              <input
                type="checkbox"
                checked={form.freeTrialAvailable}
                onChange={(e) => set('freeTrialAvailable', e.target.checked)}
              />
              <span>{t('trainer.fieldFreeTrial')}</span>
            </label>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? t('trainer.saving')
                  : editingId
                    ? t('trainer.saveChanges')
                    : t('trainer.create')}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  {t('trainer.cancel')}
                </button>
              )}
            </div>
          </form>
        </section>

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
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEdit(tr)}
                    >
                      {t('trainer.edit')}
                    </button>
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
    </div>
  )
}
