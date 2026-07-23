import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { QueryTrainingsDto } from './dto/query-trainings.dto';

const trainingInclude = {
  trainer: { select: { id: true, name: true } },
  _count: {
    select: { bookings: { where: { status: BookingStatus.CONFIRMED } } },
  },
} satisfies Prisma.TrainingInclude;

type TrainingWithMeta = Prisma.TrainingGetPayload<{
  include: typeof trainingInclude;
}>;

// Genereer nooit verder vooruit dan dit, ook niet als de trainer een verdere
// activeUntil kiest — voorkomt dat één herhalende training onbeperkt veel
// rijen aanmaakt. (~3 maanden, zie suggestie in issue #75.)
const MAX_RECURRENCE_HORIZON_DAYS = 92;
// Extra harde bovengrens op het aantal gegenereerde sessies per reeks.
const MAX_SESSIONS_PER_SERIES = 120;

function parseDateOnly(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

function parseTimeOfDay(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
}

@Injectable()
export class TrainingsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(training: TrainingWithMeta) {
    const bookingsCount = training._count.bookings;
    return {
      id: training.id,
      title: training.title,
      description: training.description,
      sport: training.sport,
      level: training.level,
      startTime: training.startTime,
      endTime: training.endTime,
      location: training.location,
      city: training.city,
      neighborhood: training.neighborhood,
      postalCode: training.postalCode,
      capacity: training.capacity,
      price: training.price,
      freeTrialAvailable: training.freeTrialAvailable,
      photos: training.photos,
      trainerId: training.trainerId,
      seriesId: training.seriesId,
      trainer: training.trainer,
      bookingsCount,
      availableSpots: training.capacity - bookingsCount,
      createdAt: training.createdAt,
    };
  }

  async findAll(query: QueryTrainingsDto) {
    const where: Prisma.TrainingWhereInput = {};

    if (query.sport) {
      where.sport = query.sport;
    }

    const and: Prisma.TrainingWhereInput[] = [];

    if (query.level) {
      // Trainingen zonder niveau ("alle niveaus") blijven ook zichtbaar
      // wanneer op een specifiek niveau gefilterd wordt.
      and.push({ OR: [{ level: query.level }, { level: null }] });
    }

    if (query.q) {
      const contains = { contains: query.q, mode: 'insensitive' } as const;
      and.push({
        OR: [
          { location: contains },
          { city: contains },
          { neighborhood: contains },
          { postalCode: contains },
        ],
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) {
        where.startTime.gte = new Date(query.from);
      }
      if (query.to) {
        where.startTime.lte = new Date(query.to);
      }
    } else {
      // default: only future trainings
      where.startTime = { gte: new Date() };
    }

    const trainings = await this.prisma.training.findMany({
      where,
      include: trainingInclude,
      orderBy: { startTime: 'asc' },
    });

    return trainings.map((t) => this.serialize(t));
  }

  async findMine(trainerId: string) {
    const trainings = await this.prisma.training.findMany({
      where: { trainerId },
      include: trainingInclude,
      orderBy: { startTime: 'asc' },
    });
    return trainings.map((t) => this.serialize(t));
  }

  async findOne(id: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: trainingInclude,
    });
    if (!training) {
      throw new NotFoundException('Training not found');
    }
    return this.serialize(training);
  }

  async create(trainerId: string, dto: CreateTrainingDto) {
    if (dto.recurrence) {
      return this.createRecurringSeries(trainerId, dto, dto.recurrence);
    }
    return this.createSingle(trainerId, dto);
  }

  private async createSingle(trainerId: string, dto: CreateTrainingDto) {
    const start = new Date(dto.startTime as string);
    const end = new Date(dto.endTime as string);

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (start <= new Date()) {
      throw new BadRequestException('startTime must be in the future');
    }

    const training = await this.prisma.training.create({
      data: {
        title: dto.title,
        description: dto.description,
        sport: dto.sport,
        level: dto.level,
        startTime: start,
        endTime: end,
        location: dto.location,
        city: dto.city,
        neighborhood: dto.neighborhood,
        postalCode: dto.postalCode,
        capacity: dto.capacity,
        price: dto.price,
        freeTrialAvailable: dto.freeTrialAvailable ?? false,
        photos: dto.photos ?? [],
        trainerId,
      },
      include: trainingInclude,
    });
    return this.serialize(training);
  }

  // Genereert uit een herhaalregel de losse, individueel boekbare sessies
  // (elk een gewone Training-rij) en groepeert ze via seriesId.
  private async createRecurringSeries(
    trainerId: string,
    dto: CreateTrainingDto,
    recurrence: CreateRecurrenceDto,
  ) {
    const { hour: startHour, minute: startMinute } = parseTimeOfDay(
      recurrence.startTime,
    );
    const { hour: endHour, minute: endMinute } = parseTimeOfDay(
      recurrence.endTime,
    );
    if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const from = parseDateOnly(recurrence.activeFrom);
    const until = parseDateOnly(recurrence.activeUntil);
    const activeFrom = new Date(from.year, from.month - 1, from.day);
    const activeUntilRequested = new Date(until.year, until.month - 1, until.day);
    if (
      Number.isNaN(activeFrom.getTime()) ||
      Number.isNaN(activeUntilRequested.getTime())
    ) {
      throw new BadRequestException('Invalid activeFrom/activeUntil date');
    }
    if (activeUntilRequested < activeFrom) {
      throw new BadRequestException('activeUntil must be on or after activeFrom');
    }

    // Cap de generatiehorizon, ongeacht hoe ver activeUntil in de toekomst ligt.
    const maxHorizon = new Date(activeFrom);
    maxHorizon.setDate(maxHorizon.getDate() + MAX_RECURRENCE_HORIZON_DAYS);
    const generationEnd =
      activeUntilRequested < maxHorizon ? activeUntilRequested : maxHorizon;

    const daysOfWeek = Array.from(new Set(recurrence.daysOfWeek));
    const now = new Date();

    const sessions: { startTime: Date; endTime: Date }[] = [];
    const cursor = new Date(activeFrom);
    while (cursor <= generationEnd) {
      if (daysOfWeek.includes(cursor.getDay())) {
        const start = new Date(cursor);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(cursor);
        end.setHours(endHour, endMinute, 0, 0);
        if (start > now) {
          sessions.push({ startTime: start, endTime: end });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (sessions.length === 0) {
      throw new BadRequestException(
        'No future sessions fall within the given days of week and date range',
      );
    }
    if (sessions.length > MAX_SESSIONS_PER_SERIES) {
      throw new BadRequestException(
        `Too many sessions requested (max ${MAX_SESSIONS_PER_SERIES}); narrow the date range or days of week`,
      );
    }

    const series = await this.prisma.trainingSeries.create({
      data: {
        title: dto.title,
        description: dto.description,
        sport: dto.sport,
        location: dto.location,
        city: dto.city,
        neighborhood: dto.neighborhood,
        postalCode: dto.postalCode,
        capacity: dto.capacity,
        price: dto.price,
        freeTrialAvailable: dto.freeTrialAvailable ?? false,
        daysOfWeek,
        startTime: recurrence.startTime,
        endTime: recurrence.endTime,
        activeFrom,
        activeUntil: activeUntilRequested,
        trainerId,
      },
    });

    await this.prisma.training.createMany({
      data: sessions.map((session) => ({
        title: dto.title,
        description: dto.description,
        sport: dto.sport,
        level: dto.level,
        startTime: session.startTime,
        endTime: session.endTime,
        location: dto.location,
        city: dto.city,
        neighborhood: dto.neighborhood,
        postalCode: dto.postalCode,
        capacity: dto.capacity,
        price: dto.price,
        freeTrialAvailable: dto.freeTrialAvailable ?? false,
        trainerId,
        seriesId: series.id,
      })),
    });

    const trainings = await this.prisma.training.findMany({
      where: { seriesId: series.id },
      include: trainingInclude,
      orderBy: { startTime: 'asc' },
    });

    return {
      seriesId: series.id,
      trainings: trainings.map((t) => this.serialize(t)),
    };
  }

  async update(id: string, trainerId: string, dto: UpdateTrainingDto) {
    const existing = await this.prisma.training.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Training not found');
    }
    if (existing.trainerId !== trainerId) {
      throw new ForbiddenException('You do not own this training');
    }

    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const training = await this.prisma.training.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        sport: dto.sport,
        level: dto.level,
        startTime: dto.startTime ? start : undefined,
        endTime: dto.endTime ? end : undefined,
        location: dto.location,
        city: dto.city,
        neighborhood: dto.neighborhood,
        postalCode: dto.postalCode,
        capacity: dto.capacity,
        price: dto.price,
        freeTrialAvailable: dto.freeTrialAvailable,
        photos: dto.photos,
      },
      include: trainingInclude,
    });
    return this.serialize(training);
  }

  async remove(id: string, trainerId: string) {
    const existing = await this.prisma.training.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Training not found');
    }
    if (existing.trainerId !== trainerId) {
      throw new ForbiddenException('You do not own this training');
    }
    await this.prisma.training.delete({ where: { id } });
  }
}
