import { makePet } from '@/test/factories/makePet';
import { ServiceSetStatusPets } from './setStatus-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { PetStatus } from '../../enterprise/entity/pets';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let sut: ServiceSetStatusPets;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceSetStatusPets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    sut = new ServiceSetStatusPets(inMemoryRepositoriesPets);
  });

  it('admin altera o status do pet corretamente', async () => {
    const pet = makePet({ status: PetStatus.ANALYSIS });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({
      actor: adminActor,
      id: pet.id.toString(),
      status: PetStatus.UNAVAILABLE,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items[0].status).toBe(PetStatus.UNAVAILABLE);
    }
  });

  it('adopter não pode alterar status do pet', async () => {
    const pet = makePet({ status: PetStatus.ANALYSIS });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({
      actor: adopterActor,
      id: pet.id.toString(),
      status: PetStatus.UNAVAILABLE,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando pet não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
      status: PetStatus.UNAVAILABLE,
    });

    expect(result.isLeft()).toBe(true);
  });
});
