import type { Training } from '../api/types'

// Wanneer geldt een training als "populair"?
//
// We leiden populariteit af uit gegevens die de API al meestuurt
// (`bookingsCount` en `capacity`), zodat het label automatisch meebeweegt
// zodra de boekingen veranderen — er is geen extra veld of endpoint nodig.
//
// Een training is populair als aan minstens één criterium wordt voldaan:
//  1. Absoluut: er zijn veel boekingen (ongeacht de zaalgrootte).
//  2. Relatief: de zaal is grotendeels vol (hoge bezettingsgraad).
export const POPULAR_MIN_BOOKINGS = 8
export const POPULAR_MIN_FILL_RATIO = 0.7

export function isPopular(training: Training): boolean {
  const bookings = training.bookingsCount ?? 0
  if (bookings >= POPULAR_MIN_BOOKINGS) return true
  if (training.capacity > 0) {
    return bookings / training.capacity >= POPULAR_MIN_FILL_RATIO
  }
  return false
}
