import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

const schemaId = `test_${randomUUID().replace(/-/g, '_')}`;

const baseUrl = new URL(process.env.DATABASE_URL);
baseUrl.searchParams.delete('schema');
const connectionString = baseUrl.toString();

const schemaUrl = new URL(process.env.DATABASE_URL);
schemaUrl.searchParams.set('schema', schemaId);
process.env.DATABASE_URL = schemaUrl.toString();

beforeAll(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`);
    await client.query(`SET search_path TO "${schemaId}"`);
    await client.query('BEGIN');

    const migrationsDir = join(process.cwd(), 'prisma', 'migrations');
    const dirs = readdirSync(migrationsDir)
      .filter((d) => statSync(join(migrationsDir, d)).isDirectory())
      .sort();

    for (const dir of dirs) {
      const sqlFile = join(migrationsDir, dir, 'migration.sql');
      if (existsSync(sqlFile)) {
        await client.query(readFileSync(sqlFile, 'utf-8'));
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}, 15000);

afterAll(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  } finally {
    await client.end();
  }
});
