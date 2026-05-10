import { z } from 'zod';
import { AdoptionStatus } from '@/domain/adoption/enterprise/entities/adoption';

export const listAdoptionsSchema = z.object({
  status: z.nativeEnum(AdoptionStatus).optional(),
  adopterId: z.string().uuid({ message: 'adopterId inválido' }).optional(),
  petId: z.string().uuid({ message: 'petId inválido' }).optional(),
  unityId: z.string().uuid({ message: 'unityId inválido' }).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export type ListAdoptionsInput = z.infer<typeof listAdoptionsSchema>;
