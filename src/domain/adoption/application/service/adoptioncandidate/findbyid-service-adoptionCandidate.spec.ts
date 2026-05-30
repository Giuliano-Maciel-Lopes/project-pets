import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceFindByIdAdoptionCandidate } from './findbyid-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let repo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceFindByIdAdoptionCandidate;

const adminActor = { id: 'admin-id', role: Role.ADMIN };

describe('ServiceFindByIdAdoptionCandidate', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceFindByIdAdoptionCandidate(repo);
  });

  it('admin pode buscar qualquer candidato', async () => {
    const candidate = makeAdoptionCandidate();
    await repo.create(candidate);

    const result = await sut.execute({
      actor: adminActor,
      id: candidate.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.adoptionCandidate.id).toEqual(candidate.id);
    }
  });

  it('adopter pode buscar seus próprios dados (por userId)', async () => {
    const ownerId = new UniqueEntityId('owner-id');
    const candidate = makeAdoptionCandidate({ userId: ownerId });
    await repo.create(candidate);

    const result = await sut.execute({
      actor: { id: 'owner-id', role: Role.ADOPTER },
      id: candidate.id.toString(),
    });

    expect(result.isRight()).toBe(true);
  });

  it('adopter não pode buscar dados de outra pessoa', async () => {
    const candidate = makeAdoptionCandidate({ userId: new UniqueEntityId('dono-id') });
    await repo.create(candidate);

    const result = await sut.execute({
      actor: { id: 'outro-id', role: Role.ADOPTER },
      id: candidate.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando candidato não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
    });

    expect(result.isLeft()).toBe(true);
  });
});
