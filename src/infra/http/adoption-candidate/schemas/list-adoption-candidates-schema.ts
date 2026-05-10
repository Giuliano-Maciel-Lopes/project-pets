import { z } from 'zod';

export const listAdoptionCandidatesSchema = z.object({
  name: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
  isBanned: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export type ListAdoptionCandidatesInput = z.infer<
  typeof listAdoptionCandidatesSchema
>;
