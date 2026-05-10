import { z } from 'zod';

export const createAdoptionSchema = z.object({
  petId: z.string().uuid({ message: 'petId inválido' }),
  adopterId: z.string().uuid({ message: 'adopterId inválido' }),
  unityId: z.string().uuid({ message: 'unityId inválido' }),
});

export type CreateAdoptionInput = z.infer<typeof createAdoptionSchema>;
