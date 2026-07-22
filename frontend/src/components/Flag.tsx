interface FlagProps {
  code: string
  className?: string
  size?: number
}

/**
 * Inline SVG country flags. We use SVG instead of emoji flags because Windows
 * does not render regional-indicator flag emoji (it shows the letters, e.g. "PT").
 */
export default function Flag({ code, className, size = 22 }: FlagProps) {
  const common = {
    className: `flag-svg ${className ?? ''}`.trim(),
    width: size,
    height: Math.round((size * 3) / 4),
    viewBox: '0 0 640 480',
    role: 'img' as const,
    'aria-hidden': true,
  }

  switch (code) {
    case 'pt':
      return (
        <svg {...common}>
          <rect width="640" height="480" fill="#f00" />
          <rect width="256" height="480" fill="#060" />
          <circle cx="256" cy="240" r="68" fill="#ff0" stroke="#fff" strokeWidth="2" />
          <circle cx="256" cy="240" r="42" fill="#c00202" />
          <circle cx="256" cy="240" r="16" fill="#fff" />
        </svg>
      )
    case 'en':
      return (
        <svg {...common}>
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path
            fill="#FFF"
            d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z"
          />
          <path
            fill="#C8102E"
            d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"
          />
          <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z" />
          <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z" />
        </svg>
      )
    case 'es':
      return (
        <svg {...common}>
          <rect width="640" height="480" fill="#AD1519" />
          <rect y="120" width="640" height="240" fill="#FABD00" />
        </svg>
      )
    case 'nl':
      return (
        <svg {...common}>
          <rect width="640" height="480" fill="#fff" />
          <rect width="640" height="160" fill="#AE1C28" />
          <rect y="320" width="640" height="160" fill="#21468B" />
        </svg>
      )
    default:
      return null
  }
}
