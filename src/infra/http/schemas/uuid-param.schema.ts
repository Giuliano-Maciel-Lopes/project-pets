import { z } from 'zod';

export const uuidParamSchema = z.string().uuid({ message: 'ID inválido, deve ser um UUID' });

export type UuidParam = z.infer<typeof uuidParamSchema>;
