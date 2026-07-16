import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const training = await this.prisma.training.findUnique({
      where: { id: dto.trainingId },
    });
    if (!training) {
      throw new NotFoundException('Training not found');
    }

    if (training.startTime <= new Date()) {
      throw new BadRequestException('Cannot book a training in the past');
    }

    const confirmedCount = await this.prisma.booking.count({
      where: { trainingId: training.id, status: BookingStatus.CONFIRMED },
    });
    if (confirmedCount >= training.capacity) {
      throw new ConflictException('Training is full');
    }

    const existing = await this.prisma.booking.findUnique({
      where: {
        userId_trainingId: { userId, trainingId: training.id },
      },
    });

    if (existing) {
      if (existing.status === BookingStatus.CONFIRMED) {
        throw new ConflictException('Already booked this training');
      }
      // Was CANCELLED -> flip back to CONFIRMED
      return this.prisma.booking.update({
        where: { id: existing.id },
        data: { status: BookingStatus.CONFIRMED },
      });
    }

    return this.prisma.booking.create({
      data: {
        userId,
        trainingId: training.id,
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  async findMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        training: {
          include: {
            trainer: { select: { id: true, name: true } },
            _count: {
              select: {
                bookings: { where: { status: BookingStatus.CONFIRMED } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not own this booking');
    }
    await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }
}
