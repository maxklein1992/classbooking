import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TrainingBrowser from '../components/TrainingBrowser'

export default function SearchResultsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''

  // Local input, kept in sync with the URL so the field reflects the active search.
  const [search, setSearch] = useState(q)
  useEffect(() => {
    setSearch(q)
  }, [q])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const next = search.trim()
    navigate(next ? `/zoeken?q=${encodeURIComponent(next)}` : '/zoeken')
  }

  return (
    <div className="page">
      <form className="search-refine" onSubmit={handleSearch} role="search">
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
        <button type="submit" className="btn btn-primary">
          {t('home.searchButton')}
        </button>
      </form>

      <TrainingBrowser query={q ? { q } : {}} place={q || null} />
    </div>
  )
}
