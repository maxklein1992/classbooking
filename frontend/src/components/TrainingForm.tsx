import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreateTrainingPayload, Sport, Training } from '../api/types'
import { SPORTS, sportLabel } from '../lib/sports'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../lib/dates'
import { useToast } from './ToastProvider'

// Dagen van de week in JS Date.getDay()-volgorde (0=zondag..6=zaterdag),
// weergegeven in de gebruikelijke Europese volgorde (maandag eerst).
const WEEKDAYS: { value: number; labelKey: string }[] = [
  { value: 1, labelKey: 'trainer.dayMon' },
  { value: 2, labelKey: 'trainer.dayTue' },
  { value: 3, labelKey: 'trainer.dayWed' },
  { value: 4, labelKey: 'trainer.dayThu' },
  { value: 5, labelKey: 'trainer.dayFri' },
  { value: 6, labelKey: 'trainer.daySat' },
  { value: 0, labelKey: 'trainer.daySun' },
]

function todayDateValue(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

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
  mode: 'single' | 'recurring'
  recurDaysOfWeek: number[]
  recurStartTime: string // "HH:mm"
  recurEndTime: string // "HH:mm"
  recurActiveFrom: string // "YYYY-MM-DD"
  recurActiveUntil: string // "YYYY-MM-DD"
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
  mode: 'single',
  recurDaysOfWeek: [],
  recurStartTime: '18:00',
  recurEndTime: '19:00',
  recurActiveFrom: todayDateValue(),
  recurActiveUntil: '',
}

function fromTraining(training: Training): FormState {
  return {
    ...emptyForm,
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
  }
}

interface TrainingFormProps {
  initial?: Training
  onSubmit: (payload: CreateTrainingPayload) => void
  isSubmitting: boolean
  onCancel?: () => void
}

export default function TrainingForm({
  initial,
  onSubmit,
  isSubmitting,
  onCancel,
}: TrainingFormProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const isEditing = !!initial
  const [form, setForm] = useState<FormState>(
    initial ? fromTraining(initial) : emptyForm,
  )

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const capacity = Number(form.capacity)
    if (!Number.isFinite(capacity) || capacity < 1) {
      showToast(t('trainer.capacityMin'), 'error')
      return
    }

    const isRecurring = !isEditing && form.mode === 'recurring'
    const base = {
      title: form.title.trim(),
      description: form.description.trim(),
      sport: form.sport,
      location: form.location.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined,
      capacity,
      price: Number(form.price) || 0,
      freeTrialAvailable: form.freeTrialAvailable,
    }

    if (isRecurring) {
      if (form.recurDaysOfWeek.length === 0) {
        showToast(t('trainer.recurrenceDaysRequired'), 'error')
        return
      }
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/
      if (
        !timePattern.test(form.recurStartTime) ||
        !timePattern.test(form.recurEndTime)
      ) {
        showToast(t('trainer.recurrenceInvalidTimes'), 'error')
        return
      }
      if (form.recurEndTime <= form.recurStartTime) {
        showToast(t('trainer.recurrenceEndAfterStart'), 'error')
        return
      }
      if (!form.recurActiveFrom || !form.recurActiveUntil) {
        showToast(t('trainer.recurrenceInvalidDates'), 'error')
        return
      }
      if (form.recurActiveUntil < form.recurActiveFrom) {
        showToast(t('trainer.recurrenceUntilAfterFrom'), 'error')
        return
      }

      const payload: CreateTrainingPayload = {
        ...base,
        recurrence: {
          daysOfWeek: form.recurDaysOfWeek,
          startTime: form.recurStartTime,
          endTime: form.recurEndTime,
          activeFrom: form.recurActiveFrom,
          activeUntil: form.recurActiveUntil,
        },
      }
      onSubmit(payload)
      return
    }

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
    if (!isEditing && start <= new Date()) {
      showToast(t('trainer.startInFuture'), 'error')
      return
    }

    const payload: CreateTrainingPayload = {
      ...base,
      startTime: fromDatetimeLocalValue(form.startTime),
      endTime: fromDatetimeLocalValue(form.endTime),
    }
    onSubmit(payload)
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      recurDaysOfWeek: f.recurDaysOfWeek.includes(day)
        ? f.recurDaysOfWeek.filter((d) => d !== day)
        : [...f.recurDaysOfWeek, day],
    }))
  }

  return (
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
      {!isEditing && (
        <label className="field">
          <span>{t('trainer.recurringMode')}</span>
          <select
            value={form.mode}
            onChange={(e) =>
              set('mode', e.target.value as FormState['mode'])
            }
          >
            <option value="single">{t('trainer.modeSingle')}</option>
            <option value="recurring">{t('trainer.modeRecurring')}</option>
          </select>
        </label>
      )}

      {form.mode === 'single' || isEditing ? (
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
      ) : (
        <div className="recurrence-fields">
          <div className="field">
            <span>{t('trainer.recurrenceDays')}</span>
            <div className="weekday-picker">
              {WEEKDAYS.map((day) => (
                <label key={day.value} className="weekday-check">
                  <input
                    type="checkbox"
                    checked={form.recurDaysOfWeek.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />
                  <span>{t(day.labelKey)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="field-row">
            <label className="field">
              <span>{t('trainer.recurrenceStart')}</span>
              <input
                type="time"
                value={form.recurStartTime}
                onChange={(e) => set('recurStartTime', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{t('trainer.recurrenceEnd')}</span>
              <input
                type="time"
                value={form.recurEndTime}
                onChange={(e) => set('recurEndTime', e.target.value)}
                required
              />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>{t('trainer.recurrenceFrom')}</span>
              <input
                type="date"
                value={form.recurActiveFrom}
                onChange={(e) => set('recurActiveFrom', e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{t('trainer.recurrenceUntil')}</span>
              <input
                type="date"
                value={form.recurActiveUntil}
                onChange={(e) => set('recurActiveUntil', e.target.value)}
                required
              />
            </label>
          </div>
          <p className="muted recurrence-hint">{t('trainer.recurrenceHint')}</p>
        </div>
      )}
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? t('trainer.saving')
            : isEditing
              ? t('trainer.saveChanges')
              : t('trainer.create')}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('trainer.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
