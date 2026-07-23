import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
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

    if (query.q) {
      const contains = { contains: query.q, mode: 'insensitive' } as const;
      where.OR = [
        { location: contains },
        { city: contains },
        { neighborhood: contains },
        { postalCode: contains },
      ];
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

    const training = await this.prisma.training.create({
      data: {
        title: dto.title,
        description: dto.description,
        sport: dto.sport,
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
