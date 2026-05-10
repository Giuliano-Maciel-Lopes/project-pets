import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

const schemaId = `test_${randomUUID().replace(/-/g, '_')}`;

const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('schema', schemaId);
process.env.DATABASE_URL = url.toString();

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: schemaId },
);
const prisma = new PrismaClient({ adapter } as any);

beforeAll(async () => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}, 30000);

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`);
  await prisma.$disconnect();
});
