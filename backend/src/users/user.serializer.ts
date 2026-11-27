import { User } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  teamMembers: string[];
  createdAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    teamMembers: user.teamMembers ?? [],
    createdAt: user.createdAt,
  };
}

/**
 * Serializer voor de PUBLIEKE trainers-lijst. Laat bewust het e-mailadres weg:
 * die lijst is zonder authenticatie opvraagbaar (teacher-dropdown), dus e-mail
 * zou anders voor iedereen zichtbaar zijn.
 */
export type PublicTrainer = Omit<PublicUser, 'email'>;

export function toPublicTrainer(user: User): PublicTrainer {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    teamMembers: user.teamMembers ?? [],
    createdAt: user.createdAt,
  };
}
