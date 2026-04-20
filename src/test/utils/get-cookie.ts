import { Response } from 'supertest';

export function getCookies(res: Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw]) as string[];
}
