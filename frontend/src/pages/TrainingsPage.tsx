import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTrainings } from '../api/trainings'
import type { Sport, Training } from '../api/types'
import { SPORTS, sportLabel } from '../lib/sports'
import TrainingBrowser from '../components/TrainingBrowser'

type Availability = 'all' | 'available'

export default function TrainingsPage() {
  const { t } = useTranslation()
  // Zoekterm kan uit de URL komen (bijv. na zoeken op de homepagina:
  // /trainingen?q=...). De zoekbalk wordt daarmee voorgevuld.
  const [params] = useSearchParams()
  const queryParam = params.get('q')?.trim() ?? ''
  const [search, setSearch] = useState(queryParam)
  const [sport, setSport] = useState<Sport | ''>('')
  const [availability, setAvailability] = useState<Availability>('all')

  // Volg wijzigingen van de URL-zoekterm (bijv. opnieuw zoeken vanaf de home).
  useEffect(() => {
    setSearch(queryParam)
  }, [queryParam])

  // Combined filter + search, applied client-side so both work together and
  // update instantly. The same query cache entry as TrainingBrowser is reused.
  const predicate = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (tr: Training) => {
      if (sport && tr.sport !== sport) return false
      if (availability === 'available' && tr.availableSpots <= 0) return false
      if (!needle) return true
      const haystack = [
        tr.title,
        tr.description,
        tr.trainer?.name,
        tr.location,
        tr.neighborhood,
        tr.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    }
  }, [search, sport, availability])

  const { data } = useQuery<Training[]>({
    queryKey: ['trainings', {}],
    queryFn: () => getTrainings({}),
  })

  const resultCount = data ? data.filter(predicate).length : null
  const hasFilters =
    search.trim() !== '' || sport !== '' || availability !== 'all'

  function clearFilters() {
    setSearch('')
    setSport('')
    setAvailability('all')
  }

  return (
    <div className="page trainings-page">
      {/* Zoekbalk over de volle breedte, boven het resultatengedeelte. */}
      <div className="search-refine trainings-search" role="search">
        <span className="hero-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          value={search}
          aria-label={t('trainings.searchLabel')}
          placeholder={t('trainings.searchPlaceholder')}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="trainings-layout">
        <aside className="filters-card card" aria-label={t('trainings.filtersTitle')}>
          <h2 className="filters-title">{t('trainings.filtersTitle')}</h2>

          <label className="filter-field">
            <span>{t('home.sport')}</span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as Sport | '')}
            >
              <option value="">{t('home.allSports')}</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>
                  {sportLabel(s, t)}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>{t('trainings.availability')}</span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
            >
              <option value="all">{t('trainings.availabilityAll')}</option>
              <option value="available">
                {t('trainings.availabilityAvailable')}
              </option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={clearFilters}
            >
              {t('home.clearFilters')}
            </button>
          )}
        </aside>

        <div className="trainings-results">
          {resultCount !== null && (
            <p className="muted result-count">
              {t('trainings.resultCount', { count: resultCount })}
            </p>
          )}

          <TrainingBrowser
            query={{}}
            heading={t('trainings.heading')}
            filterPredicate={predicate}
          />
        </div>
      </div>
    </div>
  )
}
