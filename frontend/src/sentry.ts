// Foutmeldingen naar Sentry. Zonder VITE_SENTRY_DSN (bv. lokaal) doet dit niets.
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  // 10% van de paginaladingen meten voor performance; fouten gaan altijd mee.
  tracesSampleRate: 0.1,
  // Alleen eigen API-calls koppelen aan backend-traces (same-origin /api).
  tracePropagationTargets: [/^\/api/, /^http:\/\/localhost:3001\/api/],
})
