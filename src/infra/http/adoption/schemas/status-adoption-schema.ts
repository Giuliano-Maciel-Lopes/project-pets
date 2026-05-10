import { z } from 'zod';
import { AdoptionStatus } from '@/domain/adoption/enterprise/entities/adoption';

export const statusAdoptionSchema = z.object({
  status: z.nativeEnum(AdoptionStatus),
});

export type StatusAdoptionInput = z.infer<typeof statusAdoptionSchema>;
