import { api, USE_MOCKS } from './client'
import { mock } from '../mocks/data'
import type {
  CreateTrainingPayload,
  Training,
  TrainingsQuery,
  UpdateTrainingPayload,
} from './types'

export async function getTrainings(
  query: TrainingsQuery = {},
): Promise<Training[]> {
  if (USE_MOCKS) return mock.getTrainings(query)
  const params: Record<string, string> = {}
  if (query.sport) params.sport = query.sport
  if (query.level) params.level = query.level
  if (query.from) params.from = query.from
  if (query.to) params.to = query.to
  if (query.q) params.q = query.q
  const { data } = await api.get<Training[]>('/trainings', { params })
  return data
}

export async function getMyTrainings(): Promise<Training[]> {
  if (USE_MOCKS) return mock.getMyTrainings()
  const { data } = await api.get<Training[]>('/trainings/mine')
  return data
}

export async function getTraining(id: string): Promise<Training> {
  if (USE_MOCKS) return mock.getTraining(id)
  const { data } = await api.get<Training>(`/trainings/${id}`)
  return data
}

export async function createTraining(
  payload: CreateTrainingPayload,
): Promise<Training> {
  const { data } = await api.post<Training>('/trainings', payload)
  return data
}

export async function updateTraining(
  id: string,
  payload: UpdateTrainingPayload,
): Promise<Training> {
  const { data } = await api.patch<Training>(`/trainings/${id}`, payload)
  return data
}

export async function deleteTraining(id: string): Promise<void> {
  await api.delete(`/trainings/${id}`)
}
