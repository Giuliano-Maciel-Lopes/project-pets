import { PolicyContextEntity } from "@/core/police/AdoptionPolicyContext";

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
