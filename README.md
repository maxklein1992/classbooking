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

## Demo-accounts (na seed)

| Rol | E-mail | Wachtwoord |
|-----|--------|-----------|
| Trainer | trainer@demo.com | password123 |
| Gebruiker | user@demo.com | password123 |

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
