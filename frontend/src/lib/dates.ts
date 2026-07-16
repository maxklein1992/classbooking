import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl })
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'EEEE d MMMM yyyy', { locale: nl })
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE d MMM', { locale: nl })
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: nl })
}

export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
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
