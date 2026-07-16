import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function NavBar() {
  const { isAuthenticated, isTrainer, user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-dot" />
          {t('common.brand')}
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={linkClass} end>
            {t('nav.trainings')}
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/mijn-boekingen" className={linkClass}>
              {t('nav.myBookings')}
            </NavLink>
          )}

          {isTrainer && (
            <NavLink to="/trainer" className={linkClass}>
              {t('nav.trainerDashboard')}
            </NavLink>
          )}
        </nav>

        <div className="nav-account">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <span className="nav-user">
                {user?.name}
                {isTrainer && (
                  <span className="role-chip">{t('nav.trainerChip')}</span>
                )}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost">
                {t('nav.login')}
              </NavLink>
              <NavLink to="/register" className="btn btn-primary">
                {t('nav.register')}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
