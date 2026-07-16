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
          <svg
            className="brand-mark"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 2C7.6 2 4 5.4 4 9.6c0 5.2 6.3 11.2 7.4 12.2.3.3.9.3 1.2 0C13.7 20.8 20 14.8 20 9.6 20 5.4 16.4 2 12 2z"
              fill="currentColor"
            />
            <circle cx="12" cy="9.5" r="2.9" fill="#fff" />
          </svg>
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
