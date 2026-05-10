import { z } from 'zod';

export const updateAdoptionCandidateSchema = z.object({
  name: z.string().trim().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }),
  phone: z.string().trim().min(10, { message: 'Telefone inválido' }),
  identityUrl: z.string().url({ message: 'identityUrl deve ser uma URL válida' }),
});

export type UpdateAdoptionCandidateInput = z.infer<
  typeof updateAdoptionCandidateSchema
>;
