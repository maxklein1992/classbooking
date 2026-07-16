import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function NavBar() {
  const { isAuthenticated, isTrainer, user, logout } = useAuth()
  const navigate = useNavigate()

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
          ClassBooking
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={linkClass} end>
            Trainingen
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/mijn-boekingen" className={linkClass}>
              Mijn boekingen
            </NavLink>
          )}

          {isTrainer && (
            <NavLink to="/trainer" className={linkClass}>
              Trainer dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-account">
          {isAuthenticated ? (
            <>
              <span className="nav-user">
                {user?.name}
                {isTrainer && <span className="role-chip">Trainer</span>}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost">
                Inloggen
              </NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Registreren
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
