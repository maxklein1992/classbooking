import { useState } from 'react'

interface Props {
  src?: string
  name: string
  size?: number
}

/** Toont een foto; valt terug op initialen als de afbeelding niet laadt. */
export default function Avatar({ src, name, size = 40 }: Props) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const style = { width: size, height: size, fontSize: size * 0.4 }

  if (src && !failed) {
    return (
      <img
        className="avatar"
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span className="avatar avatar-fallback" style={style} aria-label={name}>
      {initials}
    </span>
  )
}
