import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage, getValidationDetail } from '../api/client'
import type { Role } from '../api/types'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Vooraf "Trainer" selecteren bij doorklik vanuit de trainer-CTA
  // (/register?role=trainer); anders blijft "USER" de standaard.
  const [role, setRole] = useState<Role>(
    params.get('role') === 'trainer' ? 'TRAINER' : 'USER',
  )
  // Teamledennamen, alleen relevant/zichtbaar wanneer role === 'TRAINER'.
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function addTeamMember() {
    setTeamMembers((prev) => [...prev, ''])
  }

  function updateTeamMember(index: number, value: string) {
    setTeamMembers((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  function removeTeamMember(index: number) {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }
    setSubmitting(true)
    try {
      const trimmedTeamMembers = teamMembers
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
      await register({
        name,
        email,
        password,
        role,
        ...(role === 'TRAINER' ? { teamMembers: trimmedTeamMembers } : {}),
      })
      navigate('/', { replace: true })
    } catch (err) {
      const detail = getValidationDetail(err)
      setError(detail ? `${getErrorMessage(err)} (${detail})` : getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>{t('auth.registerTitle')}</h1>
        <p className="muted">{t('auth.registerSubtitle')}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>{t('auth.name')}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>{t('auth.email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>{t('auth.password')}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small className="muted">{t('auth.passwordHint')}</small>
          </label>

          <fieldset className="role-choice">
            <legend>{t('auth.roleLegend')}</legend>
            <label
              className={`role-option${role === 'USER' ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value="USER"
                checked={role === 'USER'}
                onChange={() => setRole('USER')}
              />
              <span className="role-title">{t('auth.roleUser')}</span>
              <span className="role-sub muted">{t('auth.roleUserSub')}</span>
            </label>
            <label
              className={`role-option${role === 'TRAINER' ? ' selected' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value="TRAINER"
                checked={role === 'TRAINER'}
                onChange={() => setRole('TRAINER')}
              />
              <span className="role-title">{t('auth.roleTrainer')}</span>
              <span className="role-sub muted">{t('auth.roleTrainerSub')}</span>
            </label>
          </fieldset>

          {role === 'TRAINER' && (
            <fieldset className="team-members-field">
              <legend>{t('auth.teamMembersLegend')}</legend>
              <p className="muted">{t('auth.teamMembersHint')}</p>

              {teamMembers.map((member, index) => (
                <div className="team-member-row" key={index}>
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateTeamMember(index, e.target.value)}
                    placeholder={t('auth.teamMemberPlaceholder')}
                    aria-label={t('auth.teamMemberPlaceholder')}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeTeamMember(index)}
                    aria-label={t('auth.removeTeamMember')}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-ghost"
                onClick={addTeamMember}
              >
                {t('auth.addTeamMember')}
              </button>
            </fieldset>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? t('common.busy') : t('auth.registerSubmit')}
          </button>
        </form>

        <p className="auth-alt">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.loginHere')}</Link>
        </p>
      </div>
    </div>
  )
}
