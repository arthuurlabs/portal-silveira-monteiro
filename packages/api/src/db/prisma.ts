import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../env.js';
import { PrismaClient } from '../generated/prisma/client.js';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};
const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
});
const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const db = prisma;
export { db };
