// Sentry moet geladen zijn vóórdat de rest van de app wordt geïmporteerd,
// zodat het HTTP-, Express- en Prisma-aanroepen kan instrumenteren.
// Zonder SENTRY_DSN (bv. lokaal) doet dit niets.
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
  // 10% van de requests meten voor performance; fouten worden altijd gestuurd.
  tracesSampleRate: 0.1,
});
