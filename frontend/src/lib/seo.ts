import { useEffect } from 'react'

interface Seo {
  /** Paginatitel (wordt de <title> en document.title). */
  title: string
  /** Meta description voor zoekmachines. */
  description?: string
}

const BASE_TITLE = 'Classo'

function upsertMeta(name: string, content: string): () => void {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  )
  const created = !tag
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  const previous = tag.getAttribute('content')
  tag.setAttribute('content', content)

  return () => {
    if (!tag) return
    if (created) {
      tag.remove()
    } else if (previous !== null) {
      tag.setAttribute('content', previous)
    }
  }
}

/**
 * Zet de documenttitel en meta description voor de huidige pagina en herstelt
 * de vorige waarden wanneer de pagina wordt verlaten. Zo krijgt elke (blog)pagina
 * een eigen, beschrijvende titel + meta description — belangrijk voor SEO.
 */
export function useSeo({ title, description }: Seo): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE

    const restoreDescription = description
      ? upsertMeta('description', description)
      : undefined

    return () => {
      document.title = previousTitle
      restoreDescription?.()
    }
  }, [title, description])
}
