import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TrainingBrowser from '../components/TrainingBrowser'

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Detect the visitor's own location (browser geolocation + reverse geocoding)
  // so the heading can say "Classes near <their city>".
  const [detectedPlace, setDetectedPlace] = useState<string | null>(null)
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const lang = i18n.language?.split('-')[0] || 'en'
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`,
          )
          const data = await res.json()
          const place =
            data.city || data.locality || data.principalSubdivision || null
          if (!cancelled && place) setDetectedPlace(place)
        } catch {
          // ignore — heading falls back to "near you"
        }
      },
      () => {
        // permission denied or unavailable — heading falls back to "near you"
      },
      { timeout: 8000 },
    )
    return () => {
      cancelled = true
    }
  }, [i18n.language])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/trainingen?q=${encodeURIComponent(q)}` : '/trainingen')
  }

  const steps = t('home.howItWorks.steps', { returnObjects: true }) as Array<{
    title: string
    body: string
  }>

  const faqItems = t('home.faq.items', { returnObjects: true }) as Array<{
    q: string
    a: string
  }>

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <form className="hero-search" onSubmit={handleSearch} role="search">
            <span className="hero-search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              value={search}
              aria-label={t('home.location')}
              placeholder={t('home.locationPlaceholder')}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              {t('home.searchButton')}
            </button>
          </form>
        </div>
      </section>

      <section className="trainer-cta" aria-label={t('home.trainerCta.title')}>
        <div className="trainer-cta-text">
          <h2>{t('home.trainerCta.title')}</h2>
          <p>{t('home.trainerCta.body')}</p>
        </div>
        <Link to="/register" className="btn btn-primary btn-lg">
          {t('home.trainerCta.button')}
        </Link>
      </section>

      <section className="what-is">
        <div className="what-is-media">
          <img
            src="https://images.unsplash.com/photo-1684266370915-382b2329278c?auto=format&fit=crop&w=900&q=80"
            alt=""
          />
        </div>
        <div className="what-is-content">
          <h2>{t('home.whatTitle')}</h2>
          <p>{t('home.whatBody')}</p>
        </div>
      </section>

      <section className="how-it-works" aria-label={t('home.howItWorks.title')}>
        <h2>{t('home.howItWorks.title')}</h2>
        <ol className="steps">
          {Array.isArray(steps) &&
            steps.map((step, i) => (
              <li key={i} className="step">
                <span className="step-number" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </li>
            ))}
        </ol>
      </section>

      <section className="faq" aria-label={t('home.faq.title')}>
        <h2>{t('home.faq.title')}</h2>
        <div className="faq-list">
          {Array.isArray(faqItems) &&
            faqItems.map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
        </div>
      </section>

      <TrainingBrowser place={detectedPlace} />
    </div>
  )
}
