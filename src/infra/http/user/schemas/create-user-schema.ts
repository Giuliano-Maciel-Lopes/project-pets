import { z } from 'zod';

export const AccountcreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'necessário no mínimo 3 caracteres' }),
  email: z
    .string()
    .trim()
    .email({ message: 'email inválido' })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .trim()
    .min(6, { message: 'é necessário no mínimo 6 caracteres' }),
});

export type CreateAccountInput = z.infer<typeof AccountcreateSchema>;
