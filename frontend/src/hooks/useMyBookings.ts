import { useQuery } from '@tanstack/react-query'
import { getMyBookings } from '../api/bookings'
import { useAuth } from '../auth/AuthContext'
import type { Booking } from '../api/types'

export function useMyBookings() {
  const { isAuthenticated } = useAuth()
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'mine'],
    queryFn: getMyBookings,
    enabled: isAuthenticated,
  })
}

// Set of trainingIds the user currently has a CONFIRMED booking for.
export function useBookedTrainingIds(): Set<string> {
  const { data } = useMyBookings()
  const ids = new Set<string>()
  for (const b of data ?? []) {
    if (b.status === 'CONFIRMED') ids.add(b.trainingId)
  }
  return ids
}
