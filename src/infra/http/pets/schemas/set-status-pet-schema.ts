import { z } from 'zod';

export const setStatusPetSchema = z.object({
  status: z.enum(['available', 'unavailable', 'analysis'], {
    message: 'Status inválido',
  }),
});

export type SetStatusPetInput = z.infer<typeof setStatusPetSchema>;
