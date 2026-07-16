import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/client'
import type { Role } from '../api/types'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('USER')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten.')
      return
    }
    setSubmitting(true)
    try {
      await register({ name, email, password, role })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Account aanmaken</h1>
        <p className="muted">Maak een account om te boeken of les te geven.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Naam</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Wachtwoord</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small className="muted">Minimaal 6 tekens.</small>
          </label>

          <fieldset className="role-choice">
            <legend>Wat wil je doen?</legend>
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
              <span className="role-title">Ik wil boeken</span>
              <span className="role-sub muted">Deelnemer / sporter</span>
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
              <span className="role-title">Ik ben trainer</span>
              <span className="role-sub muted">Trainingen aanbieden</span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Bezig…' : 'Registreren'}
          </button>
        </form>

        <p className="auth-alt">
          Heb je al een account? <Link to="/login">Log hier in</Link>
        </p>
      </div>
    </div>
  )
}
