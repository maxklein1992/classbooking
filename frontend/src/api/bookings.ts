import { api } from './client'
import type { Booking, CreateBookingPayload } from './types'

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', payload)
  return data
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/mine')
  return data
}

export async function deleteBooking(id: string): Promise<void> {
  await api.delete(`/bookings/${id}`)
}
