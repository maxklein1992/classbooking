import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/client'
import Avatar from '../components/Avatar'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 1_000_000 // 1 MB

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read-error'))
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, updateAvatar, removeAvatar } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!user) return null

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setError(null)
    setSuccess(null)
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = '' // sta herselectie toe
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('profile.errorType'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t('profile.errorSize'))
      return
    }

    setBusy(true)
    try {
      const dataUrl = await readAsDataUrl(file)
      await updateAvatar(dataUrl)
      setSuccess(t('profile.saved'))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      await removeAvatar()
      setSuccess(t('profile.removed'))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div>
          <h1>{t('profile.title')}</h1>
          <p className="muted">{t('profile.subtitle')}</p>
        </div>
      </div>

      <section className="card profile-card">
        <div className="profile-avatar">
          <Avatar src={user.avatarUrl ?? undefined} name={user.name} size={112} />
        </div>

        <div className="profile-photo-actions">
          <h2>{t('profile.photoTitle')}</h2>
          <p className="muted">{t('profile.photoHint')}</p>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert" role="status">
              {success}
            </div>
          )}

          <div className="profile-buttons">
            <label className="btn btn-primary">
              {busy ? t('common.busy') : t('profile.upload')}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                disabled={busy}
                hidden
              />
            </label>
            {user.avatarUrl && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleRemove}
                disabled={busy}
              >
                {t('profile.remove')}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
