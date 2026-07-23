// Dummy data zodat de app werkt zonder backend/database.
// Zet VITE_USE_MOCKS=false om de echte API te gebruiken.

import type {
  AuthResponse,
  Booking,
  LoginPayload,
  RegisterPayload,
  Review,
  Role,
  Sport,
  TrainerRef,
  Training,
  TrainingsQuery,
  User,
} from '../api/types'

// Foto's per sport, voor de fotocarrousel bovenaan de trainingsdetailpagina.
const PHOTOS_BY_SPORT: Record<Sport, string[]> = {
  BOXING: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?auto=format&fit=crop&w=900&q=80',
  ],
  FOOTVOLLEY: [
    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520138422717-6f6b3c9c7f8e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80',
  ],
  YOGA: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
  ],
  HIIT: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  ],
  SPINNING: [
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=900&q=80',
  ],
  OTHER: [
    'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
  ],
}

// Extra teamleden (naast de hoofdtrainer) die op de "Team"-tab verschijnen.
const EXTRA_TEAM: TrainerRef[] = [
  {
    id: 'tm-rui',
    name: 'Rui Tavares',
    avatarUrl: 'https://i.pravatar.cc/200?img=52',
    bio: 'Assistent-trainer, gespecialiseerd in warming-up en mobiliteit.',
    role: 'Assistent-trainer',
  },
  {
    id: 'tm-marta',
    name: 'Marta Nunes',
    avatarUrl: 'https://i.pravatar.cc/200?img=27',
    bio: 'Voedings- en herstelcoach voor deelnemers van alle niveaus.',
    role: 'Coach',
  },
]

// ---- Helpers ----------------------------------------------------------------

/** Datum N dagen vanaf nu, op een bepaald uur. */
function at(daysFromNow: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function plusHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3600_000).toISOString()
}

function review(
  id: string,
  author: string,
  img: number,
  rating: number,
  comment: string,
  daysAgo: number,
): Review {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id,
    author,
    avatarUrl: `https://i.pravatar.cc/100?img=${img}`,
    rating,
    comment,
    date: d.toISOString(),
  }
}

function avg(reviews: Review[]): number {
  if (!reviews.length) return 0
  return (
    Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) /
    10
  )
}

// ---- Trainers ---------------------------------------------------------------

const trainers = {
  miguel: {
    id: 'tr-miguel',
    name: 'Miguel Santos',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    bio: 'Ex-boxeador profissional com 10 anos de experiência. Foco em técnica, ritmo e confiança para todos os níveis.',
  },
  beatriz: {
    id: 'tr-beatriz',
    name: 'Beatriz Costa',
    avatarUrl: 'https://i.pravatar.cc/300?img=45',
    bio: 'Atleta de futevólei e treinadora na praia da Costa da Caparica. Energia positiva e muito jogo.',
  },
  sofia: {
    id: 'tr-sofia',
    name: 'Sofia Almeida',
    avatarUrl: 'https://i.pravatar.cc/300?img=32',
    bio: 'Professora de yoga certificada (Vinyasa & Hatha). Aulas calmas mas desafiantes, para corpo e mente.',
  },
  joao: {
    id: 'tr-joao',
    name: 'João Ferreira',
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
    bio: 'Personal trainer especializado em HIIT e condicionamento físico. Vamos suar e divertir-nos!',
  },
  ana: {
    id: 'tr-ana',
    name: 'Ana Rodrigues',
    avatarUrl: 'https://i.pravatar.cc/300?img=49',
    bio: 'Instrutora de indoor cycling apaixonada por música e watts. Prepara-te para pedalar ao ritmo certo.',
  },
} as const

// ---- Trainings --------------------------------------------------------------

function build(): Training[] {
  const raw: Array<Omit<Training, 'rating' | 'reviewsCount' | 'availableSpots'>> = [
    {
      id: 'trn-1',
      title: 'Boxe para iniciantes',
      description:
        'Aprende os fundamentos do boxe: guarda, jab, direto e trabalho de pés. Aula intensa que combina técnica e condição física num ambiente descontraído.',
      sport: 'BOXING',
      startTime: at(1, 18, 30),
      endTime: plusHours(at(1, 18, 30), 1),
      location: 'Ginásio Fight Club',
      city: 'Lisboa',
      neighborhood: 'Alvalade',
      postalCode: '1700-093',
      lat: 38.7566,
      lng: -9.1441,
      capacity: 12,
      price: 10,
      freeTrialAvailable: true,
      trainerId: trainers.miguel.id,
      trainer: trainers.miguel,
      bookingsCount: 5,
      createdAt: at(-20, 10),
      reviews: [
        review('r1', 'Pedro M.', 5, 5, 'O Miguel é um excelente treinador, expliquei tudo com paciência. Recomendo!', 6),
        review('r2', 'Rita S.', 20, 4, 'Aula puxada mas muito boa. Saí exausta e feliz.', 13),
        review('r3', 'Tiago L.', 33, 5, 'Melhor aula de boxe que já fiz em Lisboa.', 27),
      ],
    },
    {
      id: 'trn-2',
      title: 'Futevólei na praia',
      description:
        'Sessão de futevólei na areia para todos os níveis. Trabalha técnica, agilidade e diversão garantida com vista para o mar.',
      sport: 'FOOTVOLLEY',
      startTime: at(2, 11, 0),
      endTime: plusHours(at(2, 11, 0), 1.5),
      location: 'Praia da Costa da Caparica',
      city: 'Almada',
      neighborhood: 'Costa da Caparica',
      postalCode: '2825-450',
      lat: 38.6404,
      lng: -9.2357,
      capacity: 8,
      price: 8,
      trainerId: trainers.beatriz.id,
      trainer: trainers.beatriz,
      bookingsCount: 6,
      createdAt: at(-15, 10),
      reviews: [
        review('r4', 'Carlos V.', 51, 5, 'Que manhã! A Beatriz tem uma energia contagiante.', 4),
        review('r5', 'Marta F.', 5, 5, 'Adorei jogar na praia, já marquei a próxima.', 9),
      ],
    },
    {
      id: 'trn-3',
      title: 'Vinyasa Yoga ao pôr do sol',
      description:
        'Fluxo dinâmico de Vinyasa para alongar, fortalecer e relaxar. Termina com meditação guiada enquanto o sol se põe.',
      sport: 'YOGA',
      startTime: at(3, 19, 0),
      endTime: plusHours(at(3, 19, 0), 1),
      location: 'Estúdio Namaste',
      city: 'Porto',
      neighborhood: 'Cedofeita',
      postalCode: '4050-192',
      lat: 41.1579,
      lng: -8.6291,
      capacity: 15,
      price: 12,
      freeTrialAvailable: true,
      trainerId: trainers.sofia.id,
      trainer: trainers.sofia,
      bookingsCount: 9,
      createdAt: at(-30, 10),
      reviews: [
        review('r6', 'Inês C.', 47, 5, 'A voz da Sofia é puro relaxamento. Aula maravilhosa.', 2),
        review('r7', 'Bruno A.', 60, 4, 'Ótima para começar no yoga. Ambiente lindo.', 11),
        review('r8', 'Helena R.', 26, 5, 'Saio sempre renovada. Cinco estrelas.', 18),
        review('r9', 'Nuno P.', 8, 5, 'Perfeito para desligar do trabalho.', 25),
      ],
    },
    {
      id: 'trn-4',
      title: 'HIIT Bootcamp',
      description:
        '45 minutos de treino intervalado de alta intensidade. Queima calorias, ganha força e supera os teus limites com o João.',
      sport: 'HIIT',
      startTime: at(1, 7, 30),
      endTime: plusHours(at(1, 7, 30), 0.75),
      location: 'Parque da Cidade',
      city: 'Porto',
      neighborhood: 'Foz do Douro',
      postalCode: '4100-365',
      lat: 41.1621,
      lng: -8.6840,
      capacity: 20,
      price: 7,
      trainerId: trainers.joao.id,
      trainer: trainers.joao,
      bookingsCount: 20,
      createdAt: at(-10, 10),
      reviews: [
        review('r10', 'Sara M.', 16, 4, 'Brutal! O João motiva imenso.', 3),
        review('r11', 'Diogo T.', 68, 5, 'Começar o dia assim não tem preço.', 7),
      ],
    },
    {
      id: 'trn-5',
      title: 'Indoor Cycling / Spinning',
      description:
        'Pedala ao ritmo da música numa aula de spinning cheia de energia. Intervalos, subidas e muita motivação.',
      sport: 'SPINNING',
      startTime: at(4, 20, 0),
      endTime: plusHours(at(4, 20, 0), 0.75),
      location: 'Ride Studio',
      city: 'Lisboa',
      neighborhood: 'Arroios',
      postalCode: '1000-100',
      lat: 38.7304,
      lng: -9.1349,
      capacity: 16,
      price: 9,
      trainerId: trainers.ana.id,
      trainer: trainers.ana,
      bookingsCount: 7,
      createdAt: at(-8, 10),
      reviews: [
        review('r12', 'Filipa G.', 41, 5, 'As playlists da Ana são incríveis. Adorei!', 1),
        review('r13', 'André S.', 53, 4, 'Grande treino de cardio, sala espetacular.', 6),
        review('r14', 'Joana B.', 9, 5, 'Saio sempre a sorrir (e encharcada).', 14),
      ],
    },
  ]

  return raw.map((t) => ({
    ...t,
    reviews: t.reviews,
    reviewsCount: t.reviews?.length ?? 0,
    rating: avg(t.reviews ?? []),
    availableSpots: Math.max(0, t.capacity - t.bookingsCount),
    photos: PHOTOS_BY_SPORT[t.sport] ?? PHOTOS_BY_SPORT.OTHER,
    team: [
      { id: t.trainer.id, name: t.trainer.name, avatarUrl: t.trainer.avatarUrl, bio: t.trainer.bio, role: 'Hoofdtrainer' },
      ...EXTRA_TEAM,
    ],
  }))
}

const TRAININGS: Training[] = build()

// ---- Mock booking store (localStorage) --------------------------------------

const BOOKINGS_KEY = 'classo_mock_bookings'
const USER_KEY = 'classo_mock_user'

function loadBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]') as Booking[]
  } catch {
    return []
  }
}

function saveBookings(list: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
}

function confirmedCount(trainingId: string): number {
  return loadBookings().filter(
    (b) => b.trainingId === trainingId && b.status === 'CONFIRMED',
  ).length
}

/**
 * Rol afleiden van het e-mailadres in mock-modus, passend bij de backend-seed:
 * trainer@demo.com (of elk adres waarvan het deel vóór de @ met "trainer"
 * begint) is TRAINER; al het overige is USER.
 */
function roleForEmail(email: string): Role {
  const local = email.trim().toLowerCase().split('@')[0]
  return local.startsWith('trainer') ? 'TRAINER' : 'USER'
}

/** Training met beschikbare plaatsen bijgewerkt op basis van mock-boekingen. */
function withSpots(t: Training): Training {
  const mine = confirmedCount(t.id)
  return {
    ...t,
    availableSpots: Math.max(0, t.capacity - t.bookingsCount - mine),
  }
}

function currentUser(): User {
  try {
    const u = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null
    if (u) return u
  } catch {
    // ignore
  }
  return {
    id: 'demo-user',
    email: 'demo@classo.pt',
    name: 'Demo',
    role: 'USER',
    createdAt: new Date().toISOString(),
  }
}

// ---- Mock API ---------------------------------------------------------------

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const mock = {
  async getTrainings(query: TrainingsQuery = {}): Promise<Training[]> {
    await delay()
    const needle = query.q?.trim().toLowerCase()
    const matchesLocation = (t: Training) =>
      !needle ||
      [t.location, t.city, t.neighborhood, t.postalCode]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(needle))
    return TRAININGS.filter(
      (t) => (!query.sport || t.sport === query.sport) && matchesLocation(t),
    ).map(withSpots)
  },

  async getTraining(id: string): Promise<Training> {
    await delay()
    const t = TRAININGS.find((x) => x.id === id)
    if (!t) throw { response: { status: 404, data: { message: 'Not found' } } }
    return withSpots(t)
  },

  async getMyTrainings(): Promise<Training[]> {
    await delay()
    return []
  },

  async createBooking(trainingId: string): Promise<Booking> {
    await delay()
    const list = loadBookings()
    const existing = list.find((b) => b.trainingId === trainingId)
    if (existing?.status === 'CONFIRMED') {
      throw { response: { status: 409, data: { message: 'Already booked' } } }
    }
    if (existing) {
      existing.status = 'CONFIRMED'
      saveBookings(list)
      return existing
    }
    const booking: Booking = {
      id: `bk-${trainingId}-${Date.now()}`,
      userId: currentUser().id,
      trainingId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    }
    list.push(booking)
    saveBookings(list)
    return booking
  },

  async getMyBookings(): Promise<Booking[]> {
    await delay()
    return loadBookings().map((b) => ({
      ...b,
      training: TRAININGS.find((t) => t.id === b.trainingId),
    }))
  },

  async deleteBooking(id: string): Promise<void> {
    await delay()
    const list = loadBookings()
    const b = list.find((x) => x.id === id)
    if (b) b.status = 'CANCELLED'
    saveBookings(list)
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay()
    const user: User = {
      id: 'demo-user',
      email: payload.email,
      name: payload.email.split('@')[0] || 'Demo',
      // Leid de rol af van het account, passend bij de backend-seed:
      // trainer@demo.com (of een e-mail die met "trainer" begint) is TRAINER.
      role: roleForEmail(payload.email),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { accessToken: 'mock-token', user }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay()
    const user: User = {
      id: 'demo-user',
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'USER',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { accessToken: 'mock-token', user }
  },

  async getMe(): Promise<User> {
    await delay(100)
    return currentUser()
  },

  async updateAvatar(avatarUrl: string): Promise<User> {
    await delay(150)
    const user = { ...currentUser(), avatarUrl }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },

  async removeAvatar(): Promise<User> {
    await delay(150)
    const user = { ...currentUser(), avatarUrl: null }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
  },
}
