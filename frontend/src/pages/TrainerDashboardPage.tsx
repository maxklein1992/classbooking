import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  formatDateTime,
  formatPrice,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../lib/dates'
import SportBadge from '../components/SportBadge'

interface FormState {
  title: string
  description: string
  sport: Sport
  startTime: string // datetime-local value
  endTime: string // datetime-local value
  location: string
  capacity: string
  price: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  sport: 'BOXING',
  startTime: '',
  endTime: '',
  location: '',
  capacity: '10',
  price: '0',
}

export default function TrainerDashboardPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setFeedback(editingId ? 'Training bijgewerkt.' : 'Training aangemaakt.')
      resetForm()
      invalidate()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTraining(id),
    onSuccess: () => {
      setFeedback('Training verwijderd.')
      invalidate()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['trainings'] })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(t: Training) {
    setEditingId(t.id)
    setError(null)
    setForm({
      title: t.title,
      description: t.description,
      sport: t.sport,
      startTime: toDatetimeLocalValue(t.startTime),
      endTime: toDatetimeLocalValue(t.endTime),
      location: t.location,
      capacity: String(t.capacity),
      price: String(t.price),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const start = new Date(form.startTime)
    const end = new Date(form.endTime)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError('Vul een geldige start- en eindtijd in.')
      return
    }
    if (end <= start) {
      setError('De eindtijd moet na de starttijd liggen.')
      return
    }
    const capacity = Number(form.capacity)
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError('Capaciteit moet minimaal 1 zijn.')
      return
    }

    const payload: CreateTrainingPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      sport: form.sport,
      startTime: fromDatetimeLocalValue(form.startTime),
      endTime: fromDatetimeLocalValue(form.endTime),
      location: form.location.trim(),
      capacity,
      price: Number(form.price) || 0,
    }
    saveMutation.mutate(payload)
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Trainer dashboard</h1>
      </div>

      {feedback && (
        <div className="alert" role="status">
          {feedback}
          <button className="alert-close" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      <div className="dashboard-layout">
        <section className="card form-card">
          <h2>{editingId ? 'Training bewerken' : 'Nieuwe training'}</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Titel</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Beschrijving</span>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
              />
            </label>
            <label className="field">
              <span>Sport</span>
              <select
                value={form.sport}
                onChange={(e) => set('sport', e.target.value as Sport)}
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {sportLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-row">
              <label className="field">
                <span>Starttijd</span>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Eindtijd</span>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Locatie</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Capaciteit</span>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Prijs (€)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? 'Opslaan…'
                  : editingId
                    ? 'Wijzigingen opslaan'
                    : 'Training aanmaken'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  Annuleren
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="dashboard-list">
          <h2>Mijn trainingen</h2>
          {isLoading && <p className="muted">Laden…</p>}
          {isError && <p className="text-danger">Kon trainingen niet laden.</p>}
          {!isLoading && trainings && trainings.length === 0 && (
            <div className="empty-state card">
              <p className="muted">
                Je hebt nog geen trainingen aangemaakt. Gebruik het formulier.
              </p>
            </div>
          )}
          {trainings && trainings.length > 0 && (
            <div className="booking-list">
              {trainings.map((t) => (
                <article key={t.id} className="card booking-row">
                  <div className="booking-main">
                    <div className="booking-head">
                      <SportBadge sport={t.sport} />
                      <span className="booking-title">{t.title}</span>
                    </div>
                    <ul className="meta-list compact">
                      <li>🕒 {formatDateTime(t.startTime)}</li>
                      <li>📍 {t.location}</li>
                      <li>
                        👥 {t.bookingsCount}/{t.capacity} geboekt
                      </li>
                      <li>💶 {formatPrice(t.price)}</li>
                    </ul>
                  </div>
                  <div className="booking-actions">
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEdit(t)}
                    >
                      Bewerken
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Weet je zeker dat je "${t.title}" wilt verwijderen?`,
                          )
                        ) {
                          deleteMutation.mutate(t.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Verwijderen
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
