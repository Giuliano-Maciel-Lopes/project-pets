import { z } from 'zod';

export const toggleActiveUnitSchema = z.object({
  isActive: z.boolean(),
});

export type ToggleActiveUnitInput = z.infer<typeof toggleActiveUnitSchema>;
