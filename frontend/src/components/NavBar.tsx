import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Avatar from "./Avatar";

export default function NavBar() {
  const { isAuthenticated, isTrainer, user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  // Mobiel menu (hamburger), alleen zichtbaar onder 860px.
  const [menuOpen, setMenuOpen] = useState(false);

  // Sluit het menu na navigeren en met Escape.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <header className={menuOpen ? "navbar menu-open" : "navbar"}>
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img
            className="brand-mark"
            src="/classo-mark.svg"
            width="28"
            height="28"
            alt=""
            aria-hidden="true"
          />
          {t("common.brand")}
        </Link>

        <nav
          className="nav-links"
          id="main-nav"
          // Ook sluiten bij een klik op de link naar de huidige pagina.
          onClick={() => setMenuOpen(false)}
        >
          {/* Home: verborgen voor ingelogde trainers. */}
          {!isTrainer && (
            <NavLink to="/" className={linkClass} end>
              {t("nav.home")}
            </NavLink>
          )}

          {!isTrainer && (
            <NavLink to="/trainingen" className={linkClass}>
              {t("nav.trainings")}
            </NavLink>
          )}

          {/* Blog, Over ons en Contact: alleen voor niet-ingelogde bezoekers. */}
          {!isAuthenticated && (
            <>
              <NavLink to="/blog" className={linkClass}>
                {t("nav.blog")}
              </NavLink>

              <NavLink to="/over-ons" className={linkClass}>
                {t("nav.about")}
              </NavLink>

              <NavLink to="/contact" className={linkClass}>
                {t("nav.contact")}
              </NavLink>
            </>
          )}

          {isAuthenticated && !isTrainer && (
            <NavLink to="/mijn-boekingen" className={linkClass}>
              {t("nav.myBookings")}
            </NavLink>
          )}

          {isTrainer && (
            <NavLink to="/trainer" className={linkClass}>
              {t("nav.trainerDashboard")}
            </NavLink>
          )}
        </nav>

        <div className="nav-account">
          <LanguageSwitcher />
          <div
            className="nav-account-actions"
            onClick={() => setMenuOpen(false)}
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/profiel"
                  className="nav-user"
                  title={t("profile.title")}
                >
                  <Avatar
                    src={user?.avatarUrl ?? undefined}
                    name={user?.name ?? "?"}
                    size={32}
                  />
                  <span className="nav-user-name">{user?.name}</span>
                  {isTrainer && (
                    <span className="role-chip">{t("nav.trainerChip")}</span>
                  )}
                </Link>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost">
                  {t("nav.login")}
                </NavLink>
                <NavLink to="/register" className="btn btn-primary">
                  {t("nav.register")}
                </NavLink>
              </>
            )}
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
        </div>
      </div>
    </header>
  );
}
