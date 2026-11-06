# classbooking

Platform om sportklassen te boeken (boksen, footvolley, yoga, ...). **Trainers** maken een account aan en plaatsen trainingen; **gebruikers** boeken die via een agenda.

## Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 18 + TypeScript + Vite, React Router, React Query, axios |
| Backend | NestJS 10, Prisma ORM, JWT auth (Passport), Swagger |
| Database | PostgreSQL (via Docker) |
| Monorepo | npm workspaces (`backend/`, `frontend/`) |

## Projectstructuur

```
classbooking/
├── backend/            NestJS API (auth, trainings, bookings) + Prisma
├── frontend/           React + Vite app
├── API_CONTRACT.md     Gedeeld API-contract (bron van waarheid)
├── docker-compose.yml  PostgreSQL
└── package.json        npm workspaces + dev-scripts
```

## Snel starten

Vereist: Node 20+, npm 10+, Docker.

```bash
# 1. Dependencies installeren (root — installeert beide workspaces)
npm install

# 2. Database opstarten
npm run db:up            # docker compose up -d  (Postgres op :5432)

# 3. Backend env klaarzetten
#    backend/.env bestaat al met dev-waarden; kopieer anders .env.example

# 4. Database-schema aanmaken + seeden
npm run prisma:migrate -w backend   # maakt de tabellen aan (eerste keer: naam bv. "init")
npm run db:seed -w backend          # demo-trainer, demo-user en voorbeeldtrainingen

# 5. Alles draaien (backend :3001 + frontend :3000)
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- **Swagger docs: http://localhost:3001/api/docs**

### Backend via Docker

De backend kan ook in een container draaien (i.p.v. `npm run dev:backend`), met hot-reload via een gemounte volume:

```bash
docker compose up -d              # start db + backend (backend/Dockerfile wordt gebuild)

# Eenmalig / na schemawijzigingen: migraties + seed in de container uitvoeren
docker compose exec backend npx prisma migrate dev
docker compose exec backend npm run db:seed

docker compose logs -f backend    # logs volgen
docker compose down               # stoppen
```

De frontend blijft je lokaal starten met `npm run dev:frontend` (of `npm run dev` voor beide, dan draait de backend dubbel — gebruik in dat geval `npm run dev:frontend` samen met `docker compose up -d backend`).

## Handige scripts (root)

| Commando | Doet |
|----------|------|
| `npm run dev` | Backend + frontend tegelijk (concurrently) |
| `npm run dev:backend` / `npm run dev:frontend` | Eén van beide |
| `npm run build` | Beide builden |
| `npm run db:up` / `npm run db:down` | Postgres starten/stoppen |

## Rollen & flows

- **Registreren** als gebruiker (boeken) of trainer (trainingen plaatsen).
- **Trainer** → dashboard `/trainer`: training aanmaken/wijzigen/verwijderen (sport, tijd, locatie, capaciteit, prijs).
- **Gebruiker** → home `/`: agenda/lijst van komende trainingen, filteren op sport, boeken; `/mijn-boekingen` om te annuleren.
- Boeken is geblokkeerd bij volle klas (409), dubbele boeking (409) of training in het verleden (400).

Zie [API_CONTRACT.md](API_CONTRACT.md) voor alle endpoints en datastructuren.
