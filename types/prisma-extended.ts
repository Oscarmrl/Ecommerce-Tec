// Tipos extendidos para Prisma
import { User as PrismaUser } from '@prisma/client';

export interface UserWithRole extends PrismaUser {
  role: string;
}

// Extender el tipo global para Prisma Client
declare global {
  namespace PrismaClient {
    interface User extends UserWithRole {}
  }
}