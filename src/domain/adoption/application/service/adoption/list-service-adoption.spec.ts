import { makeAdoption } from '@/test/factories/makeAdoption';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { InMemoryRepositoriesAdoption } from '@/test/repositories/in-memory-adoptions';
import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceListAdoption } from './list-service-adoption';
import { Role } from '@/domain/account/enterprise/entities/users';

let adoptionRepo: InMemoryRepositoriesAdoption;
let candidateRepo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceListAdoption;

const adminUser = { email: 'admin@pets.com', role: Role.ADMIN };

describe('ServiceListAdoption', () => {
  beforeEach(() => {
    adoptionRepo = new InMemoryRepositoriesAdoption();
    candidateRepo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceListAdoption(adoptionRepo, candidateRepo);
  });

  it('admin visualiza todas as adoções', async () => {
    await adoptionRepo.create(makeAdoption());
    await adoptionRepo.create(makeAdoption());

    const result = await sut.execute({ requestingUser: adminUser, page: 1, limit: 25 });

    expect(result.total).toBe(2);
    expect(result.adoptions).toHaveLength(2);
  });

  it('adotante visualiza apenas as adoções vinculadas ao seu e-mail', async () => {
    const candidate = makeAdoptionCandidate({ email: 'dono@test.com' });
    await candidateRepo.create(candidate);

    const adotacaoDono = makeAdoption({ adopterId: candidate.id });
    const adotacaoOutra = makeAdoption();
    await adoptionRepo.create(adotacaoDono);
    await adoptionRepo.create(adotacaoOutra);

    const result = await sut.execute({
      requestingUser: { email: 'dono@test.com', role: Role.ADOPTER },
      page: 1,
      limit: 25,
    });

    expect(result.total).toBe(1);
    expect(result.adoptions[0].adopterId.toString()).toBe(candidate.id.toString());
  });

  it('adotante sem candidate cadastrado recebe lista vazia', async () => {
    await adoptionRepo.create(makeAdoption());

    const result = await sut.execute({
      requestingUser: { email: 'semcadastro@test.com', role: Role.ADOPTER },
      page: 1,
      limit: 25,
    });

    expect(result.total).toBe(0);
    expect(result.adoptions).toHaveLength(0);
  });
});
