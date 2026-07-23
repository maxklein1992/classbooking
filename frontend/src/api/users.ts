import { api, USE_MOCKS } from './client'
import { mock } from '../mocks/data'
import type { TrainerRef, User } from './types'

/** Publieke lijst van alle trainers, t.b.v. de teacher-dropdown bij trainingen. */
export async function getTrainers(): Promise<TrainerRef[]> {
  if (USE_MOCKS) return mock.getTrainers()
  const { data } = await api.get<TrainerRef[]>('/users/trainers')
  return data
}

/** Zet of vervang de profielfoto van de ingelogde gebruiker. */
export async function updateAvatar(avatarUrl: string): Promise<User> {
  if (USE_MOCKS) return mock.updateAvatar(avatarUrl)
  const { data } = await api.patch<User>('/users/me/avatar', { avatarUrl })
  return data
}

/** Verwijder de profielfoto van de ingelogde gebruiker. */
export async function removeAvatar(): Promise<User> {
  if (USE_MOCKS) return mock.removeAvatar()
  const { data } = await api.delete<User>('/users/me/avatar')
  return data
}
