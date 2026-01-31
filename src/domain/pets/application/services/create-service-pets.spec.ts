import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { ServiceCreatePets } from './create-service-pets';
import { PetSex } from '../../enterprise/entity/pets';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ServicePetAttachments } from './attachements-service-pets';
import { InMemoryRepositoriesPetsAttachements } from '@/test/repositories/in-memory-pets-Attachement';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let servicePetAttachments: ServicePetAttachments;
let sut: ServiceCreatePets;

describe('Pets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();

    inMemoryRepositoriesPetsAttachements =
      new InMemoryRepositoriesPetsAttachements();

    servicePetAttachments = new ServicePetAttachments(
      inMemoryRepositoriesPetsAttachements,
    );

    sut = new ServiceCreatePets(
      inMemoryRepositoriesPets,
      servicePetAttachments,
    );
  });

  it('deve criar um  pet  corretamente', async () => {
    const pet = {
      name: 'Boby',
      species: 'Dog',
      isActive: true,
      unitId: 'unit-123',
      breed: 'Vira-lata',
      age: 3,
      sex: PetSex.MALE,
      attachmentIds: ['1', '2'],
    };

    const result = await sut.execute(pet);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const pet = result.value.pet;

      expect(pet.id).toBeTruthy();
      expect(inMemoryRepositoriesPets.items[0]).toEqual(pet);
      expect(inMemoryRepositoriesPets.items[0].attachment.currentItems).toEqual(
        [
          expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
          expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
        ],
      );
    }
  });
});
