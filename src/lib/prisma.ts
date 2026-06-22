import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaFailed: boolean | undefined;
};

/**
 * Singleton Prisma client.
 * Falls back gracefully in serverless environments where better-sqlite3
 * native module is not available (e.g. Vercel).
 */
function createPrismaClient(): PrismaClient | null {
  try {
    // Dynamic import to avoid build-time failure when native module isn't available
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch {
    // Native module not available (serverless environment)
    // App will use demo data fallbacks
    console.warn('[prisma] better-sqlite3 not available — using demo mode');
    globalForPrisma.prismaFailed = true;
    return null;
  }
}

function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prismaFailed) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createPrismaClient();
  if (client && process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma: PrismaClient | null = getPrisma();
