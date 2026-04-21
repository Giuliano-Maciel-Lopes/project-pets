import { z } from 'zod';

export const toggleActivePetSchema = z.object({
  isActive: z.boolean(),
});

export type ToggleActivePetInput = z.infer<typeof toggleActivePetSchema>;
