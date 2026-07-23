import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createTraining } from '../api/trainings'
import { getErrorMessage } from '../api/client'
import { isTrainingSeriesResult, type CreateTrainingPayload } from '../api/types'
import { useToast } from '../components/ToastProvider'
import TrainingForm, { type TrainingFormPayload } from '../components/TrainingForm'

export default function TrainingCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const createMutation = useMutation({
    mutationFn: (payload: CreateTrainingPayload) => createTraining(payload),
    onSuccess: (result) => {
      if (isTrainingSeriesResult(result)) {
        showToast(
          t('trainer.recurringCreated', { count: result.trainings.length }),
        )
      } else {
        showToast(t('trainer.created'))
      }
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      navigate('/trainer')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  // Bij het aanmaken komt teacherId nooit expliciet `null` binnen (dat is
  // alleen relevant om een eerder gekozen teacher te wissen bij bewerken).
  function handleSubmit(payload: TrainingFormPayload) {
    createMutation.mutate({
      ...payload,
      teacherId: payload.teacherId ?? undefined,
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('trainer.newTraining')}</h1>
      </div>
      <div className="card training-form-card">
        <TrainingForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/trainer')}
        />
      </div>
    </div>
  )
}
