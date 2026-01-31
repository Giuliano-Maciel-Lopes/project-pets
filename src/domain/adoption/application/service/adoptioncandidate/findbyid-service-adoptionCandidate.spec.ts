import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceFindByIdAdoptionCandidate } from './findbyid-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceFindByIdAdoptionCandidate;

describe('AdoptionCandidate Service', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate =
      new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceFindByIdAdoptionCandidate(
      inMemoryRepositoriesAdoptionCandidate,
    );
  });

  it('deve criar um candidate corretamente', async () => {
    const candidate = makeAdoptionCandidate();
    inMemoryRepositoriesAdoptionCandidate.create(candidate);

    const result = await sut.execute({ id: candidate.id.toString() });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const adoptionCandidate = result.value.adoptionCandidate;

      expect(adoptionCandidate.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoptionCandidate.items[0]).toEqual(
        adoptionCandidate,
      );
    }
  });
});
