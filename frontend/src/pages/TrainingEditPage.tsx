import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTraining, updateTraining } from '../api/trainings'
import { getErrorMessage } from '../api/client'
import type { Training, UpdateTrainingPayload } from '../api/types'
import { useToast } from '../components/ToastProvider'
import TrainingForm from '../components/TrainingForm'

export default function TrainingEditPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const {
    data: training,
    isLoading,
    isError,
  } = useQuery<Training>({
    queryKey: ['training', id],
    queryFn: () => getTraining(id),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTrainingPayload) => updateTraining(id, payload),
    onSuccess: () => {
      showToast(t('trainer.updated'))
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      navigate('/trainer')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  if (isLoading) {
    return <div className="page muted">{t('trainer.loading')}</div>
  }

  if (isError || !training) {
    return (
      <div className="page">
        <p className="text-danger">{t('training.notFound')}</p>
        <Link to="/trainer" className="btn btn-ghost">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('trainer.editTraining')}</h1>
      </div>
      <div className="card training-form-card">
        <TrainingForm
          initial={training}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          isSubmitting={updateMutation.isPending}
          onCancel={() => navigate('/trainer')}
        />
      </div>
    </div>
  )
}
