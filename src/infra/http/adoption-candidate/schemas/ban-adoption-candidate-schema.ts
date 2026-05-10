import { z } from 'zod';

export const banAdoptionCandidateSchema = z.object({
  isBanned: z.boolean(),
  bannedReason: z.string().trim().min(5, { message: 'Motivo deve ter no mínimo 5 caracteres' }),
});

export type BanAdoptionCandidateInput = z.infer<typeof banAdoptionCandidateSchema>;
