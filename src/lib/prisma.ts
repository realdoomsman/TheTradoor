import { PrismaClient } from '@prisma/client';

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
  const isProduction = process.env.NODE_ENV === 'production';

  // Production: use Turso/libSQL (skip in dev to avoid Turbopack issues)
  if (isProduction && tursoUrl && tursoToken) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSQL } = require('@prisma/adapter-libsql');

      const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
      const adapter = new PrismaLibSQL(libsql);

      console.log('[prisma] Connected to Turso (production)');
      return new PrismaClient({ adapter, log: ['error'] });
    } catch (err) {
      console.error('[prisma] Turso connection failed:', err);
      return null;
    }
  }

  // Local dev: use better-sqlite3
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    });

    console.log('[prisma] Connected to local SQLite (dev)');
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch {
    console.warn('[prisma] No database adapter available — using demo mode');
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
