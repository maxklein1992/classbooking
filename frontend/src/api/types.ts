// Types matching API_CONTRACT.md

export type Role = 'TRAINER' | 'USER'

export type Sport =
  | 'BOXING'
  | 'FOOTVOLLEY'
  | 'YOGA'
  | 'HIIT'
  | 'SPINNING'
  | 'OTHER'

// Ontbreekt (undefined/null) betekent "alle niveaus".
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatarUrl?: string | null
  teamMembers?: string[]
  createdAt: string
}

export interface TrainerRef {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  role?: string
}

export interface GalleryImage {
  src: string
  alt: string
}

export interface Review {
  id: string
  author: string
  avatarUrl?: string
  rating: number // 1..5
  comment: string
  date: string // ISO
}

export interface Training {
  id: string
  title: string
  description: string
  sport: Sport
  level?: Level | null
  startTime: string
  endTime: string
  location: string
  city: string
  neighborhood?: string | null
  postalCode?: string | null
  lat?: number | null
  lng?: number | null
  capacity: number
  price: number
  freeTrialAvailable?: boolean
  trainerId: string
  trainer: TrainerRef
  teacherId?: string | null
  teacher?: TrainerRef | null
  bookingsCount: number
  availableSpots: number
  createdAt: string
  rating?: number // gemiddelde 1..5
  reviewsCount?: number
  reviews?: Review[]
  gallery?: GalleryImage[]
  team?: TrainerRef[]
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
  teamMembers?: string[]
}

// Trainings
export interface CreateTrainingPayload {
  title: string
  description: string
  sport: Sport
  level?: Level
  startTime: string
  endTime: string
  location: string
  city: string
  neighborhood?: string
  postalCode?: string
  capacity: number
  price: number
  freeTrialAvailable?: boolean
  teacherId?: string
}

export type UpdateTrainingPayload = Omit<
  Partial<CreateTrainingPayload>,
  'teacherId'
> & {
  // Expliciet null toegestaan om de teacher weer te wissen (aanmaker wordt
  // dan weer de impliciete teacher), naast undefined (= ongewijzigd).
  teacherId?: string | null
}

export interface TrainingsQuery {
  sport?: Sport
  level?: Level
  from?: string
  to?: string
  q?: string
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
