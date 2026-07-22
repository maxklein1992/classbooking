import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()

  const values = t('about.values', { returnObjects: true }) as Array<{
    title: string
    body: string
  }>

  return (
    <div className="page about-page">
      <div className="page-header">
        <div>
          <h1>{t('about.title')}</h1>
          <p className="muted">{t('about.subtitle')}</p>
        </div>
      </div>

      <section className="card about-card">
        <p>{t('about.intro')}</p>
        <p>{t('about.mission')}</p>
      </section>

      <div className="about-values">
        {Array.isArray(values) &&
          values.map((v) => (
            <article key={v.title} className="card about-value">
              <h3>{v.title}</h3>
              <p className="muted">{v.body}</p>
            </article>
          ))}
      </div>

      <section className="card about-cta">
        <h2>{t('about.ctaTitle')}</h2>
        <p className="muted">{t('about.ctaBody')}</p>
        <div className="about-cta-actions">
          <Link to="/" className="btn btn-primary">
            {t('about.ctaTrainings')}
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            {t('about.ctaContact')}
          </Link>
        </div>
      </section>
    </div>
  )
}
