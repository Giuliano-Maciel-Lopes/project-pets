import { makeAdoption } from '@/test/factories/makeAdoption';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { InMemoryRepositoriesAdoption } from '@/test/repositories/in-memory-adoptions';
import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceListAdoption } from './list-service-adoption';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let adoptionRepo: InMemoryRepositoriesAdoption;
let candidateRepo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceListAdoption;

const adminActor = { id: 'admin-id', role: Role.ADMIN };

describe('ServiceListAdoption', () => {
  beforeEach(() => {
    adoptionRepo = new InMemoryRepositoriesAdoption();
    candidateRepo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceListAdoption(adoptionRepo, candidateRepo);
  });

  it('admin visualiza todas as adoções', async () => {
    await adoptionRepo.create(makeAdoption());
    await adoptionRepo.create(makeAdoption());

    const result = await sut.execute({ actor: adminActor, page: 1, limit: 25 });

    expect(result.total).toBe(2);
    expect(result.adoptions).toHaveLength(2);
  });

  it('adotante visualiza apenas as adoções vinculadas ao seu userId', async () => {
    const adopterId = new UniqueEntityId('adopter-id-123');
    const candidate = makeAdoptionCandidate({ userId: adopterId });
    await candidateRepo.create(candidate);

    const adotacaoDono = makeAdoption({ adopterId: candidate.id });
    const adotacaoOutra = makeAdoption();
    await adoptionRepo.create(adotacaoDono);
    await adoptionRepo.create(adotacaoOutra);

    const result = await sut.execute({
      actor: { id: 'adopter-id-123', role: Role.ADOPTER },
      page: 1,
      limit: 25,
    });

    expect(result.total).toBe(1);
    expect(result.adoptions[0].adopterId.toString()).toBe(candidate.id.toString());
  });

  it('adotante sem candidate cadastrado recebe lista vazia', async () => {
    await adoptionRepo.create(makeAdoption());

    const result = await sut.execute({
      actor: { id: 'sem-candidate-id', role: Role.ADOPTER },
      page: 1,
      limit: 25,
    });

    expect(result.total).toBe(0);
    expect(result.adoptions).toHaveLength(0);
  });
});
