interface Props {
  rating: number // 0..5
  count?: number
  size?: number
  showValue?: boolean
}

/** Sterrenrating met exacte gedeeltelijke vulling (overlay-techniek). */
export default function StarRating({ rating, count, size = 15, showValue }: Props) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  return (
    <span className="stars-wrap">
      <span className="stars" style={{ fontSize: `${size}px` }} aria-hidden="true">
        <span className="stars-empty">★★★★★</span>
        <span className="stars-fill" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      {showValue && <span className="stars-value">{rating.toFixed(1)}</span>}
      {typeof count === 'number' && (
        <span className="stars-count">({count})</span>
      )}
    </span>
  )
}
