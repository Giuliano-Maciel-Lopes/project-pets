import { makePet } from '@/test/factories/makePet';
import { ServiceDeletePets } from './delete-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { InMemoryRepositoriesPetsAttachements } from '@/test/repositories/in-memory-pets-Attachement';
import { makePetAttachment } from '@/test/factories/makePetAttachemnts';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let sut: ServiceDeletePets;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceDeletePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPetsAttachements = new InMemoryRepositoriesPetsAttachements();
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets(inMemoryRepositoriesPetsAttachements);
    sut = new ServiceDeletePets(inMemoryRepositoriesPets);
  });

  it('admin remove um pet corretamente', async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    inMemoryRepositoriesPetsAttachements.items.push(
      makePetAttachment({ petId: pet.id, attachmentId: new UniqueEntityId('1') }),
      makePetAttachment({ petId: pet.id, attachmentId: new UniqueEntityId('2') }),
    );

    const result = await sut.execute({ actor: adminActor, id: pet.id.toString() });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items.length).toBe(0);
      expect(inMemoryRepositoriesPetsAttachements.items.length).toBe(0);
    }
  });

  it('adopter não pode remover pet', async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({ actor: adopterActor, id: pet.id.toString() });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando pet não existe', async () => {
    const result = await sut.execute({ actor: adminActor, id: 'id-inexistente' });

    expect(result.isLeft()).toBe(true);
  });
});
