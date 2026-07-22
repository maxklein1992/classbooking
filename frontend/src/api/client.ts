import axios, { AxiosError } from 'axios'
import i18n from '../i18n'
import type { ApiError } from './types'

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

// Dummy-data modus: standaard AAN zodat de app werkt zonder backend.
// Zet VITE_USE_MOCKS=false om de echte NestJS-API te gebruiken.
export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'

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

    // Prefer specific known cases. Messages are translated into the active
    // language via the i18next singleton (works outside React components).
    const t = i18n.t.bind(i18n)
    if (status === 409) {
      const msg = normalizeMessage(data?.message)
      if (msg && /vol|full|cheio|complet|capacity|capacidade/i.test(msg))
        return t('errors.full')
      return t('errors.alreadyBooked')
    }
    if (status === 400) {
      const msg = normalizeMessage(data?.message)
      if (msg && /verleden|past|passado|pasado/i.test(msg))
        return t('errors.past')
      return t('errors.badRequest')
    }
    if (status === 401) return t('errors.unauthorized')
    if (status === 403) return t('errors.forbidden')
    if (status === 404) return t('errors.notFound')

    return t('errors.generic')
  }
  return i18n.t('errors.generic')
}

function normalizeMessage(message?: string | string[]): string | undefined {
  if (!message) return undefined
  return Array.isArray(message) ? message.join(' ') : message
}
