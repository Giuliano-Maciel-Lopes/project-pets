import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);
  return url.toString();
}

const schemaId = randomUUID();
// Define a URL antes de criar o PrismaClient
process.env.DATABASE_URL = generateUniqueDatabaseURL(schemaId);

// Agora sim, instanciamos o PrismaClient
const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('antes bd');
  // Executa a migração para o schema único
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
});

afterAll(async () => {
  console.log('depois bd');
  // Deleta o schema após os testes
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`,
  );
  await prisma.$disconnect();
});
