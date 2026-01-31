import { makePet } from '@/test/factories/makePet';
import { ServiceIsActivePets } from './isActive-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let sut: ServiceIsActivePets;

describe('ServiceDeletePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    sut = new ServiceIsActivePets(inMemoryRepositoriesPets);
  });

  it('deve alterar o campo isactive pet corretamente', async () => {
    const pet = makePet({
      isActive: true,
    });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({
      id: pet.id.toString(),
      isActive: false,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items[0].isActive).toBe(false);
    }
  });
});
