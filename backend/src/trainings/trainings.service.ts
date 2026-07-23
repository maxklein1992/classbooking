import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { QueryTrainingsDto } from './dto/query-trainings.dto';

const trainingInclude = {
  trainer: { select: { id: true, name: true } },
  teacher: { select: { id: true, name: true, avatarUrl: true } },
  _count: {
    select: { bookings: { where: { status: BookingStatus.CONFIRMED } } },
  },
} satisfies Prisma.TrainingInclude;

type TrainingWithMeta = Prisma.TrainingGetPayload<{
  include: typeof trainingInclude;
}>;

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
      trainer: training.trainer,
      teacherId: training.teacherId,
      teacher: training.teacher,
      bookingsCount,
      availableSpots: training.capacity - bookingsCount,
      createdAt: training.createdAt,
    };
  }

  /** Zorgt dat een opgegeven teacherId een bestaande trainer is. */
  private async assertValidTeacher(teacherId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role !== Role.TRAINER) {
      throw new BadRequestException('teacherId must be an existing trainer');
    }
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
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (start <= new Date()) {
      throw new BadRequestException('startTime must be in the future');
    }
    if (dto.teacherId) {
      await this.assertValidTeacher(dto.teacherId);
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
        teacherId: dto.teacherId,
      },
      include: trainingInclude,
    });
    return this.serialize(training);
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
    if (dto.teacherId) {
      await this.assertValidTeacher(dto.teacherId);
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
        // teacherId === null betekent expliciet wissen; undefined = ongewijzigd.
        teacherId:
          dto.teacherId === null ? null : (dto.teacherId ?? undefined),
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
