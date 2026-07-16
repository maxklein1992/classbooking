import { User } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
