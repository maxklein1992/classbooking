import { PrismaClient, Role, Sport } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function daysFromNow(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@demo.com' },
    update: {},
    create: {
      email: 'trainer@demo.com',
      name: 'Demo Trainer',
      role: Role.TRAINER,
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'Demo User',
      role: Role.USER,
      passwordHash,
    },
  });

  const trainings = [
    {
      title: 'Boksles voor beginners',
      description: 'Techniek en conditie voor starters.',
      sport: Sport.BOXING,
      startTime: daysFromNow(2, 18),
      endTime: daysFromNow(2, 19),
      location: 'Sporthal Noord',
      capacity: 12,
      price: 10.0,
    },
    {
      title: 'Footvolley op het strand',
      description: 'Voetbal meets volleybal in het zand.',
      sport: Sport.FOOTVOLLEY,
      startTime: daysFromNow(3, 17),
      endTime: daysFromNow(3, 18),
      location: 'Strandpaviljoen Zuid',
      capacity: 8,
      price: 12.5,
    },
    {
      title: 'Ochtend Yoga',
      description: 'Rustige flow om de dag te beginnen.',
      sport: Sport.YOGA,
      startTime: daysFromNow(1, 8),
      endTime: daysFromNow(1, 9),
      location: 'Studio Centrum',
      capacity: 15,
      price: 8.0,
    },
    {
      title: 'HIIT Bootcamp',
      description: 'Intensieve intervaltraining.',
      sport: Sport.HIIT,
      startTime: daysFromNow(4, 19),
      endTime: daysFromNow(4, 20),
      location: 'Park Oost',
      capacity: 20,
      price: 9.0,
    },
  ];

  for (const t of trainings) {
    const existing = await prisma.training.findFirst({
      where: { title: t.title, trainerId: trainer.id },
    });
    if (existing) {
      await prisma.training.update({
        where: { id: existing.id },
        data: { ...t, trainerId: trainer.id },
      });
    } else {
      await prisma.training.create({
        data: { ...t, trainerId: trainer.id },
      });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
