# API Contract — classbooking

Gedeeld contract tussen backend (NestJS) en frontend (React). **Beide moeten hieraan voldoen.**

Base URL (dev): `http://localhost:3001/api`
Swagger UI: `http://localhost:3001/api/docs`

Auth: JWT Bearer token in header `Authorization: Bearer <accessToken>`.

## Rollen

- `TRAINER` — mag trainingen aanmaken/wijzigen/verwijderen.
- `USER` — mag trainingen boeken en annuleren.

(Een TRAINER mag ook boeken; een USER mag geen trainingen aanmaken.)

## Modellen (response-vorm)

### User
```json
{ "id": "uuid", "email": "a@b.com", "name": "Max", "role": "TRAINER", "createdAt": "ISO" }
```
Wachtwoord/passwordHash wordt NOOIT teruggegeven.

### Training
```json
{
  "id": "uuid",
  "title": "Boksles voor beginners",
  "description": "Techniek en conditie",
  "sport": "BOXING",
  "level": "BEGINNER",
  "startTime": "ISO",
  "endTime": "ISO",
  "location": "Sporthal Noord",
  "capacity": 12,
  "price": 10.0,
  "trainerId": "uuid",
  "trainer": { "id": "uuid", "name": "Max" },
  "bookingsCount": 3,
  "availableSpots": 9,
  "createdAt": "ISO"
}
```
`sport` enum: `BOXING`, `FOOTVOLLEY`, `YOGA`, `HIIT`, `SPINNING`, `OTHER`.
`level` enum (optioneel): `BEGINNER`, `INTERMEDIATE`, `ADVANCED`. Ontbreekt (`null`) betekent "alle niveaus".

### Booking
```json
{
  "id": "uuid",
  "userId": "uuid",
  "trainingId": "uuid",
  "status": "CONFIRMED",
  "createdAt": "ISO",
  "training": { /* Training object, optioneel meegeleverd */ }
}
```
`status` enum: `CONFIRMED`, `CANCELLED`.

## Endpoints

### Auth
- `POST /auth/register` — body `{ email, password, name, role? }` (role default `USER`) → `201 { accessToken, user }`
- `POST /auth/login` — body `{ email, password }` → `200 { accessToken, user }`
- `GET /auth/me` (auth) → `200 User`

### Trainings
- `GET /trainings?sport=&level=&from=&to=` (public) → `200 Training[]` (gesorteerd op startTime asc, alleen toekomstige tenzij from opgegeven; trainingen zonder `level` ("alle niveaus") komen ook mee als er op `level` gefilterd wordt)
- `GET /trainings/mine` (auth, TRAINER) → `200 Training[]` (eigen trainingen)
- `GET /trainings/:id` (public) → `200 Training`
- `POST /trainings` (auth, TRAINER) — body `{ title, description, sport, level?, startTime, endTime, location, capacity, price }` → `201 Training`
- `PATCH /trainings/:id` (auth, owner TRAINER) — partial body → `200 Training`
- `DELETE /trainings/:id` (auth, owner TRAINER) → `204`

### Bookings
- `POST /bookings` (auth) — body `{ trainingId }` → `201 Booking`
  - Fouten: `409` als al geboekt of vol; `400` als training in verleden.
- `GET /bookings/mine` (auth) → `200 Booking[]` (met `training` ingevuld, incl. g.annuleerde)
- `DELETE /bookings/:id` (auth, owner) → `204` (zet status op CANCELLED of verwijdert; spot komt vrij)

## Errors
Standaard NestJS error shape: `{ statusCode, message, error }`.

## Validatie-regels
- email geldig + uniek; password min 6 tekens; name verplicht.
- Training: endTime > startTime; capacity >= 1; startTime in de toekomst bij aanmaken.
