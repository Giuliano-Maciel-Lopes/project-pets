import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import {
  Adoption,
  AdoptionProps,
} from "@/domain/adoption/enterprise/entities/adoption";


export function makeAdoption(
  override: Partial<AdoptionProps> = {},
  id?: UniqueEntityId
): Adoption {
  const adoption = Adoption.create({
    adopterId: new UniqueEntityId(),
    petId: new UniqueEntityId(),
    unityId: new UniqueEntityId(),
    ...override,
  });
  return adoption;
}
