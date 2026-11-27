import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TrainingsModule } from './trainings/trainings.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate-limiting: dempt floods / DDoS-achtig verkeer af. Standaard max 100
    // requests per minuut per IP; daarboven volgt HTTP 429.
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TrainingsModule,
    BookingsModule,
  ],
  providers: [
    // Stuurt onverwachte fouten (geen 4xx HttpExceptions) naar Sentry.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    // Past de rate-limiting hierboven toe op alle routes.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
