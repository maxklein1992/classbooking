import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

interface Props {
  children: ReactNode
  requireTrainer?: boolean
}

export default function ProtectedRoute({ children, requireTrainer }: Props) {
  const { isAuthenticated, isTrainer, loading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  if (loading) {
    return <div className="page center muted">{t('common.loading')}</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireTrainer && !isTrainer) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
