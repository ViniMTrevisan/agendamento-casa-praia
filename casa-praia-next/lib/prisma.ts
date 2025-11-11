// Crie a pasta 'lib' na raiz do projeto
// Crie o arquivo 'lib/prisma.ts'

import { PrismaClient } from '@prisma/client';

// Declara um 'global' para o cliente Prisma
const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined;
};

// Cria o cliente, reutilizando o global se existir
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Em desenvolvimento, armazena o cliente no global
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}