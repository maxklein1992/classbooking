import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  photos: string[]
  /** Gebruikt voor de alt-tekst van elke foto en het aria-label van de carrousel. */
  title: string
}

// Minimale horizontale swipe-afstand (px) om als swipe te tellen i.p.v. een tik.
const SWIPE_THRESHOLD = 40

/**
 * Fotocarrousel bovenaan de trainingsdetailpagina. Toont de foto's van de
 * training met pijl-navigatie, dots en swipe-ondersteuning. Als er geen
 * foto's zijn, toont een nette placeholder.
 */
export default function PhotoCarousel({ photos, title }: Props) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="photo-carousel photo-carousel-empty" aria-label={t('detail.galleryLabel')}>
        <span className="photo-carousel-placeholder-icon" aria-hidden="true">
          🖼️
        </span>
        <span className="muted">{t('detail.noPhotos')}</span>
      </div>
    )
  }

  const count = photos.length
  const goTo = (i: number) => setIndex(((i % count) + count) % count)
  const prev = () => goTo(index - 1)
  const next = () => goTo(index + 1)

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  function onTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (delta > SWIPE_THRESHOLD) prev()
    else if (delta < -SWIPE_THRESHOLD) next()
  }

  return (
    <div
      className="photo-carousel"
      role="group"
      aria-label={t('detail.galleryLabel')}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="photo-carousel-viewport">
        <img
          key={index}
          src={photos[index]}
          alt={t('detail.photoAlt', { title, index: index + 1, count })}
          className="photo-carousel-img"
          loading={index === 0 ? 'eager' : 'lazy'}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              className="photo-carousel-arrow photo-carousel-prev"
              onClick={prev}
              aria-label={t('detail.carouselPrev')}
            >
              ‹
            </button>
            <button
              type="button"
              className="photo-carousel-arrow photo-carousel-next"
              onClick={next}
              aria-label={t('detail.carouselNext')}
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="photo-carousel-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? 'photo-carousel-dot active' : 'photo-carousel-dot'}
              onClick={() => goTo(i)}
              aria-label={t('detail.carouselGoTo', { index: i + 1 })}
              aria-current={i === index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
