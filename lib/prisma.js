// lib/prisma.js
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// Set up the connection pool and adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.prismaGlobal || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;