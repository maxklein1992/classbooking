import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
  const year = new Date().getFullYear()

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
            <li>
              <Link to="/">{t('nav.home')}</Link>
            </li>
            <li>
              <Link to="/trainingen">{t('nav.trainings')}</Link>
            </li>
            <li>
              <Link to="/blog">{t('nav.blog')}</Link>
            </li>
            <li>
              <Link to="/over-ons">{t('nav.about')}</Link>
            </li>
            <li>
              <Link to="/contact">{t('nav.contact')}</Link>
            </li>
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
