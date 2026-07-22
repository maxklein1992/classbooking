import { api, USE_MOCKS } from './client'
import { mock } from '../mocks/data'
import type { Booking, CreateBookingPayload } from './types'

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  if (USE_MOCKS) return mock.createBooking(payload.trainingId)
  const { data } = await api.post<Booking>('/bookings', payload)
  return data
}

export async function getMyBookings(): Promise<Booking[]> {
  if (USE_MOCKS) return mock.getMyBookings()
  const { data } = await api.get<Booking[]>('/bookings/mine')
  return data
}

export async function deleteBooking(id: string): Promise<void> {
  if (USE_MOCKS) return mock.deleteBooking(id)
  await api.delete(`/bookings/${id}`)
}
