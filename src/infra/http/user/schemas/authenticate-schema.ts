import { z } from 'zod';

export const authenticateSchema = z.object({
  email: z.string().trim().email({ message: 'email inválido' }),
  password: z.string().trim().min(6, { message: 'mínimo 6 caracteres' }),
});

export type AuthenticateInput = z.infer<typeof authenticateSchema>;
