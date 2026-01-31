import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { PetProps, Pets, PetSex } from '@/domain/pets/enterprise/entity/pets';

export function makePet(override: Partial<PetProps> = {}, id?: UniqueEntityId) {
  const pet = Pets.create(
    {
      name: 'Boby',
      species: 'Dog',
      breed: 'Vira-lata',
      age: 2,
      sex: PetSex.MALE,
      unitId: new UniqueEntityId(),
      ...override, // sobrescreve o que eu  quiser no teste
    },
    id,
  );

  return pet;
}
