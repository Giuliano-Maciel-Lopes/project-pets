import { makePet } from '@/test/factories/makePet';
import { ServiceIsActivePets } from './isActive-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let sut: ServiceIsActivePets;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceIsActivePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    sut = new ServiceIsActivePets(inMemoryRepositoriesPets);
  });

  it('admin altera o campo isActive corretamente', async () => {
    const pet = makePet({ isActive: true });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({ actor: adminActor, id: pet.id.toString(), isActive: false });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items[0].isActive).toBe(false);
    }
  });

  it('adopter não pode alterar isActive', async () => {
    const pet = makePet({ isActive: true });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({ actor: adopterActor, id: pet.id.toString(), isActive: false });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando pet não existe', async () => {
    const result = await sut.execute({ actor: adminActor, id: 'id-inexistente', isActive: false });

    expect(result.isLeft()).toBe(true);
  });
});
