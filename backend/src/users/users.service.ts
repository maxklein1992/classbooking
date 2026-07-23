import { Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    teamMembers?: string[];
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  updateAvatar(id: string, avatarUrl: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });
  }

  updateTeamMembers(id: string, teamMembers: string[]): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { teamMembers },
    });
  }
}
