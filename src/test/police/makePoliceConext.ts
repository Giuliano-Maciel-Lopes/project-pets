import { PolicyContextEntity } from '@/domain/adoption/police/AdoptionPolicyContext';

export function makePolicyContext(
  overrides: Partial<PolicyContextEntity> = {},
): PolicyContextEntity {
  return {
    candidate: null,
    pet: null,
    unit: null,
    ...overrides,
  };
}
