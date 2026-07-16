import axios, { AxiosError } from 'axios'
import type { ApiError } from './types'

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const TOKEN_KEY = 'classbooking_token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach bearer token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// On 401 clear token + redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearToken()
      // Avoid redirect loop when already on login/register
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

// Helper: turn an axios error into a friendly Dutch message.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiError>
    const status = err.response?.status
    const data = err.response?.data

    // Prefer specific known cases
    if (status === 409) {
      const msg = normalizeMessage(data?.message)
      if (msg && /vol|full|capacity/i.test(msg)) return 'Deze training is vol.'
      return 'Je hebt deze training al geboekt.'
    }
    if (status === 400) {
      const msg = normalizeMessage(data?.message)
      if (msg && /verleden|past/i.test(msg))
        return 'Deze training ligt in het verleden.'
      return msg ?? 'Ongeldige aanvraag. Controleer je gegevens.'
    }
    if (status === 401) return 'Je bent niet ingelogd of je sessie is verlopen.'
    if (status === 403) return 'Je hebt geen toestemming voor deze actie.'
    if (status === 404) return 'Niet gevonden.'

    const generic = normalizeMessage(data?.message)
    if (generic) return generic
  }
  return 'Er is iets misgegaan. Probeer het opnieuw.'
}

function normalizeMessage(message?: string | string[]): string | undefined {
  if (!message) return undefined
  return Array.isArray(message) ? message.join(' ') : message
}
