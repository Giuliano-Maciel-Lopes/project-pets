import { makePet } from '@/test/factories/makePet';
import { ServiceDeletePets } from './delete-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { InMemoryRepositoriesPetsAttachements } from '@/test/repositories/in-memory-pets-Attachement';
import { makePetAttachment } from '@/test/factories/makePetAttachemnts';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let sut: ServiceDeletePets;

describe('ServiceDeletePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPetsAttachements =
      new InMemoryRepositoriesPetsAttachements();
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets(
      inMemoryRepositoriesPetsAttachements,
    );

    sut = new ServiceDeletePets(inMemoryRepositoriesPets);
  });

  it('deve remover um pet corretamente', async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    inMemoryRepositoriesPetsAttachements.items.push(
      makePetAttachment({
        petId: pet.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makePetAttachment({
        petId: pet.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    );

    const result = await sut.execute({ id: pet.id.toString() });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items.length).toBe(0);
      expect(inMemoryRepositoriesPetsAttachements.items.length).toBe(0);
    }
  });
});
