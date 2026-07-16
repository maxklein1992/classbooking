// Types matching API_CONTRACT.md

export type Role = 'TRAINER' | 'USER'

export type Sport =
  | 'BOXING'
  | 'FOOTVOLLEY'
  | 'YOGA'
  | 'HIIT'
  | 'SPINNING'
  | 'OTHER'

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export interface TrainerRef {
  id: string
  name: string
}

export interface Training {
  id: string
  title: string
  description: string
  sport: Sport
  startTime: string
  endTime: string
  location: string
  capacity: number
  price: number
  trainerId: string
  trainer: TrainerRef
  bookingsCount: number
  availableSpots: number
  createdAt: string
}

export interface Booking {
  id: string
  userId: string
  trainingId: string
  status: BookingStatus
  createdAt: string
  training?: Training
}

// Auth
export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  role?: Role
}

// Trainings
export interface CreateTrainingPayload {
  title: string
  description: string
  sport: Sport
  startTime: string
  endTime: string
  location: string
  capacity: number
  price: number
}

export type UpdateTrainingPayload = Partial<CreateTrainingPayload>

export interface TrainingsQuery {
  sport?: Sport
  from?: string
  to?: string
}

// Bookings
export interface CreateBookingPayload {
  trainingId: string
}

// Errors (NestJS shape)
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
