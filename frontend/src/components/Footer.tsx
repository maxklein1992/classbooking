import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

// Contactgegevens van het (demo) platform. Als losse constante zodat ze op
// één plek staan; de labels eromheen komen uit i18n.
const CONTACT = {
  email: 'hello@classo.pt',
  phone: '+351 210 000 000',
  phoneHref: '+351210000000',
  address: 'Av. da Liberdade 100, 1250-096 Lisboa',
}

export default function Footer() {
  const { t } = useTranslation()
  const { isAuthenticated, isTrainer } = useAuth()
  const year = new Date().getFullYear()

  // Sitelinks consistent met de navigatie-regels (#47/#54):
  // - trainer: alleen trainer-relevante links;
  // - gewone gebruiker: Home + Trainingen + Mijn boekingen;
  // - niet ingelogd: alle publieke pagina's.
  const links: Array<{ to: string; label: string }> = isTrainer
    ? [
        { to: '/trainer', label: t('nav.trainerDashboard') },
        { to: '/profiel', label: t('profile.title') },
      ]
    : isAuthenticated
      ? [
          { to: '/', label: t('nav.home') },
          { to: '/trainingen', label: t('nav.trainings') },
          { to: '/mijn-boekingen', label: t('nav.myBookings') },
        ]
      : [
          { to: '/', label: t('nav.home') },
          { to: '/trainingen', label: t('nav.trainings') },
          { to: '/blog', label: t('nav.blog') },
          { to: '/over-ons', label: t('nav.about') },
          { to: '/contact', label: t('nav.contact') },
        ]

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">{t('common.brand')}</span>
          <p className="muted">{t('footer.tagline')}</p>
        </div>

        <nav className="footer-col" aria-label={t('footer.linksTitle')}>
          <h3 className="footer-title">{t('footer.linksTitle')}</h3>
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <h3 className="footer-title">{t('footer.contactTitle')}</h3>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                ✉️
              </span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                📞
              </span>
              <a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a>
            </li>
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                📍
              </span>
              <span>{CONTACT.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>{t('footer.copyright', { year })}</span>
      </div>
    </footer>
  )
}
