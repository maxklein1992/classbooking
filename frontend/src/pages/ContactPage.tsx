import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface FormState {
  name: string
  email: string
  message: string
}

const emptyForm: FormState = { name: '', email: '', message: '' }

export default function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [sent, setSent] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO: wire up to backend /contact endpoint so the message is emailed.
    // For now we just confirm locally.
    setSent(true)
    setForm(emptyForm)
  }

  return (
    <div className="page contact-page">
      <div className="page-header">
        <div>
          <h1>{t('contact.title')}</h1>
          <p className="muted">{t('contact.subtitle')}</p>
        </div>
      </div>

      <section className="card contact-card">
        {sent && (
          <div className="alert" role="status">
            {t('contact.success')}
            <button className="alert-close" onClick={() => setSent(false)}>
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>{t('contact.fieldName')}</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>{t('contact.fieldEmail')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>{t('contact.fieldMessage')}</span>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              rows={6}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            {t('contact.submit')}
          </button>
        </form>
      </section>
    </div>
  )
}
