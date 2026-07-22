import { api, USE_MOCKS } from './client'
import { mock } from '../mocks/data'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from './types'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCKS) return mock.login(payload)
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  if (USE_MOCKS) return mock.register(payload)
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function getMe(): Promise<User> {
  if (USE_MOCKS) return mock.getMe()
  const { data } = await api.get<User>('/auth/me')
  return data
}
