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
  "photos": ["https://.../foto1.jpg", "data:image/png;base64,..."],
  "trainerId": "uuid",
  "trainer": { "id": "uuid", "name": "Max" },
  "teacherId": "uuid | null",
  "teacher": { "id": "uuid", "name": "Anna", "avatarUrl": "https://..." },
  "bookingsCount": 3,
  "availableSpots": 9,
  "createdAt": "ISO"
}
```
`sport` enum: `BOXING`, `FOOTVOLLEY`, `YOGA`, `HIIT`, `SPINNING`, `OTHER`.
`level` enum (optioneel): `BEGINNER`, `INTERMEDIATE`, `ADVANCED`. Ontbreekt (`null`) betekent "alle niveaus".

`teacherId`/`teacher` zijn optioneel en puur informatief: ze geven aan wie de les
daadwerkelijk geeft, los van `trainerId` (de aanmaker/eigenaar, die bewerk- en
verwijderrechten heeft). Is er geen teacher gekozen, dan toont de UI de aanmaker
zelf als impliciete teacher. `teacherId` moet, indien opgegeven, het id van een
bestaande gebruiker met rol `TRAINER` zijn.

`photos`: lijst van foto's van de training, als http(s)-URL of als data-URL
(image/png, image/jpeg of image/webp). De volgorde van de array bepaalt de
volgorde waarin de foto's in de carrousel op de detailpagina verschijnen; max.
8 foto's, elk max. ~4MB. Wordt beheerd via `POST`/`PATCH /trainings/:id`
(alleen de eigen trainer).

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

### Users
- `GET /users/trainers` (public) → `200 PublicUser[]` (alle gebruikers met rol `TRAINER`, gesorteerd op naam) — t.b.v. de teacher-dropdown bij trainingen.

### Trainings
- `GET /trainings?sport=&level=&from=&to=` (public) → `200 Training[]` (gesorteerd op startTime asc, alleen toekomstige tenzij from opgegeven; trainingen zonder `level` ("alle niveaus") komen ook mee als er op `level` gefilterd wordt)
- `GET /trainings/mine` (auth, TRAINER) → `200 Training[]` (eigen trainingen)
- `GET /trainings/:id` (public) → `200 Training`
- `POST /trainings` (auth, TRAINER) — body `{ title, description, sport, level?, startTime, endTime, location, capacity, price, teacherId?, photos? }` → `201 Training`
- `PATCH /trainings/:id` (auth, owner TRAINER) — partial body, `teacherId` mag ook expliciet `null` zijn om te wissen → `200 Training`
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
- Training: `teacherId`, indien opgegeven, moet het id zijn van een bestaande gebruiker met rol `TRAINER`.
