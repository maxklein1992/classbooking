import { useTranslation } from 'react-i18next'

// Getoond door de Sentry ErrorBoundary als er een React-render crasht,
// i.p.v. een leeg wit scherm. De fout zelf is dan al naar Sentry gestuurd.
export function ErrorFallback() {
  const { t } = useTranslation()
  return (
    <div className="page center">
      <h2>{t('common.errorTitle')}</h2>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        {t('common.reload')}
      </button>
    </div>
  )
}
