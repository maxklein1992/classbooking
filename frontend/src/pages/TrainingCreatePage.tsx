import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createTraining } from '../api/trainings'
import { getErrorMessage } from '../api/client'
import type { CreateTrainingPayload } from '../api/types'
import { useToast } from '../components/ToastProvider'
import TrainingForm from '../components/TrainingForm'

export default function TrainingCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const createMutation = useMutation({
    mutationFn: (payload: CreateTrainingPayload) => createTraining(payload),
    onSuccess: () => {
      showToast(t('trainer.created'))
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      navigate('/trainer')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('trainer.newTraining')}</h1>
      </div>
      <div className="card training-form-card">
        <TrainingForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/trainer')}
        />
      </div>
    </div>
  )
}
