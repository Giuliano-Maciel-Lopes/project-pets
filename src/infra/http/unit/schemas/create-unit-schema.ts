import { z } from 'zod';

export const createUnitSchema = z.object({
  name: z.string().trim().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }),
  address: z.string().trim().min(5, { message: 'Endereço inválido' }),
  city: z.string().trim().min(2, { message: 'Cidade inválida' }),
  state: z
    .string()
    .trim()
    .length(2, { message: 'Estado deve ter 2 caracteres (UF)' })
    .toUpperCase(),
  managerId: z.string().uuid({ message: 'managerId inválido' }),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
