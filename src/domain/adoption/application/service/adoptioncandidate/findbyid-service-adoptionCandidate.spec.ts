import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceFindByIdAdoptionCandidate } from './findbyid-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedOwnershipError } from '@/domain/adoption/errro/unauthorizedOwnershipError';

let repo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceFindByIdAdoptionCandidate;

const adminUser = { email: 'admin@pets.com', role: Role.ADMIN };

describe('ServiceFindByIdAdoptionCandidate', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceFindByIdAdoptionCandidate(repo);
  });

  it('admin pode buscar qualquer candidato', async () => {
    const candidate = makeAdoptionCandidate({ email: 'outro@test.com' });
    await repo.create(candidate);

    const result = await sut.execute({
      id: candidate.id.toString(),
      requestingUser: adminUser,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.adoptionCandidate.id).toEqual(candidate.id);
    }
  });

  it('adotante pode buscar seus próprios dados', async () => {
    const candidate = makeAdoptionCandidate({ email: 'dono@test.com' });
    await repo.create(candidate);

    const result = await sut.execute({
      id: candidate.id.toString(),
      requestingUser: { email: 'dono@test.com', role: Role.ADOPTER },
    });

    expect(result.isRight()).toBe(true);
  });

  it('adotante não pode buscar dados de outra pessoa', async () => {
    const candidate = makeAdoptionCandidate({ email: 'outro@test.com' });
    await repo.create(candidate);

    const result = await sut.execute({
      id: candidate.id.toString(),
      requestingUser: { email: 'eu@test.com', role: Role.ADOPTER },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedOwnershipError);
  });

  it('retorna NotFoundError quando candidato não existe', async () => {
    const result = await sut.execute({
      id: 'id-inexistente',
      requestingUser: adminUser,
    });

    expect(result.isLeft()).toBe(true);
  });
});
