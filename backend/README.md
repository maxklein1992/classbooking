# classbooking — Backend

NestJS 10 + Prisma (PostgreSQL) API for the classbooking app.

## Prerequisites

- Node 22, npm 10
- A running PostgreSQL instance matching `DATABASE_URL` in `.env`

## Setup

```bash
npm install
cp .env.example .env   # already provided; adjust DATABASE_URL if needed
```

## Database

```bash
npm run prisma:generate   # generate Prisma client
npm run prisma:migrate    # create/apply migrations (dev)
npm run db:seed           # seed demo users + trainings (idempotent)
```

## Run

```bash
npm run dev     # watch mode
npm run build   # compile to dist/
npm run start   # run compiled build
```

## API

- Base URL: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/api/docs`

Auth uses JWT Bearer tokens (`Authorization: Bearer <accessToken>`).
CORS is enabled for the frontend dev server at `http://localhost:3000`.
