import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../../config/env';
import { withSoftDelete } from './soft-delete';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'error'],
  });

export const db = withSoftDelete(basePrisma);

export type DbClient = typeof db;
export type TransactionClient = Omit<DbClient, '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on'>;
export type DbClientOrTx = DbClient | TransactionClient;

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}
