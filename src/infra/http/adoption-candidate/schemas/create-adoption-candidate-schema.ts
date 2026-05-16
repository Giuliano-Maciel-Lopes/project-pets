import { z } from 'zod';

export const createAdoptionCandidateSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }),
  name: z.string().trim().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: 'CPF inválido' }),
  phone: z.string().trim().min(10, { message: 'Telefone inválido' }),
  identityUrl: z.string().url({ message: 'identityUrl deve ser uma URL válida' }),
});

export type CreateAdoptionCandidateInput = z.infer<
  typeof createAdoptionCandidateSchema
>;
