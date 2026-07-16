import { api } from './client'
import type {
  CreateTrainingPayload,
  Training,
  TrainingsQuery,
  UpdateTrainingPayload,
} from './types'

export async function getTrainings(
  query: TrainingsQuery = {},
): Promise<Training[]> {
  const params: Record<string, string> = {}
  if (query.sport) params.sport = query.sport
  if (query.from) params.from = query.from
  if (query.to) params.to = query.to
  const { data } = await api.get<Training[]>('/trainings', { params })
  return data
}

export async function getMyTrainings(): Promise<Training[]> {
  const { data } = await api.get<Training[]>('/trainings/mine')
  return data
}

export async function getTraining(id: string): Promise<Training> {
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
