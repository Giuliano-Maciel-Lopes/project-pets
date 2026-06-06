import { Role } from '@/domain/account/enterprise/entities/users';

export const SYSTEM_ACTOR = { id: 'system', role: Role.ADMIN } as const;
