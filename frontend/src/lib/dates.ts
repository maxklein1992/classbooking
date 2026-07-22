import { format, type Locale } from 'date-fns'
import { enUS, es, nl, pt } from 'date-fns/locale'
import i18n from '../i18n'

// Pick the date-fns locale for the active i18next language.
// Portuguese uses European Portuguese (pt), not Brazilian (ptBR).
export function currentLocale(): Locale {
  const lng = i18n.language || 'pt'
  if (lng.startsWith('es')) return es
  if (lng.startsWith('en')) return enUS
  if (lng.startsWith('nl')) return nl
  return pt
}

// Locale string for Intl-based number/currency formatting.
function currentIntlLocale(): string {
  const lng = i18n.language || 'pt'
  if (lng.startsWith('es')) return 'es-ES'
  if (lng.startsWith('en')) return 'en-GB'
  if (lng.startsWith('nl')) return 'nl-NL'
  return 'pt-PT'
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'EEEE d MMMM yyyy, HH:mm', {
    locale: currentLocale(),
  })
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'EEEE d MMMM yyyy', { locale: currentLocale() })
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE d MMM', { locale: currentLocale() })
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: currentLocale() })
}

export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(currentIntlLocale(), {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Convert an ISO string to the value a datetime-local input expects.
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

// Convert a datetime-local input value into an ISO string.
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString()
}
