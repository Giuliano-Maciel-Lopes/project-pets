import { z } from 'zod';

export const listPetsSchema = z.object({
  name: z.string().trim().optional(),
  species: z.string().trim().optional(),
  breed: z.string().trim().optional(),
  status: z.enum(['available', 'unavailable', 'analysis']).optional(),
  sex: z.enum(['male', 'female']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  unitId: z.string().uuid({ message: 'unitId inválido' }).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export type ListPetsInput = z.infer<typeof listPetsSchema>;
