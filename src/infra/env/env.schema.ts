import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3333),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;
