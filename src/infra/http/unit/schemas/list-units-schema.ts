import { z } from 'zod';

export const listUnitsSchema = z.object({
  name: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().length(2).toUpperCase().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  isPrincipal: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  managerId: z.string().uuid({ message: 'managerId inválido' }).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export type ListUnitsInput = z.infer<typeof listUnitsSchema>;
