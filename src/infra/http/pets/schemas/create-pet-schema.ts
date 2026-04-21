import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().trim().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }),
  species: z.string().trim().min(2, { message: 'Espécie inválida' }),
  breed: z.string().trim().min(2, { message: 'Raça inválida' }),
  age: z.number().int().positive().optional(),
  sex: z.enum(['male', 'female']).optional(),
  unitId: z.string().uuid({ message: 'unitId inválido' }),
  attachmentIds: z.array(z.string().uuid()).default([]),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
