import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaFailed: boolean | undefined;
};

/**
 * Singleton Prisma client.
 * Uses libSQL/Turso in production, better-sqlite3 for local dev.
 */
function createPrismaClient(): PrismaClient | null {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Use Turso when credentials are available
  if (tursoUrl && tursoToken) {
    try {
      const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
      console.log('[prisma] Connected to Turso');
      return new PrismaClient({ adapter, log: ['error'] });
    } catch (err) {
      console.error('[prisma] Turso connection failed:', err);
      // Fall through to try SQLite
    }
  }

  // Local dev: use better-sqlite3
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    });
    console.log('[prisma] Connected to local SQLite');
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch {
    console.warn('[prisma] No database adapter available — demo mode');
    globalForPrisma.prismaFailed = true;
    return null;
  }
}

function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prismaFailed) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createPrismaClient();
  if (client) {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma: PrismaClient | null = getPrisma();
