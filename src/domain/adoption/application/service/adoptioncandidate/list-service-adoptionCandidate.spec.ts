import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceListAdoptionCandidate } from './list-service-adoptionCandidate';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedOwnershipError } from '@/domain/adoption/errro/unauthorizedOwnershipError';

let repo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceListAdoptionCandidate;

const adminUser = { email: 'admin@pets.com', role: Role.ADMIN };
const adopterUser = { email: 'adopter@test.com', role: Role.ADOPTER };

describe('ServiceListAdoptionCandidate', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceListAdoptionCandidate(repo);
  });

  it('admin retorna todos os candidates com paginação', async () => {
    await repo.create(makeAdoptionCandidate());
    await repo.create(makeAdoptionCandidate());

    const result = await sut.execute({ requestingUser: adminUser, page: 1, limit: 25 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(2);
      expect(result.value.candidates).toHaveLength(2);
    }
  });

  it('non-admin recebe erro de acesso negado', async () => {
    await repo.create(makeAdoptionCandidate());

    const result = await sut.execute({ requestingUser: adopterUser, page: 1, limit: 25 });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedOwnershipError);
  });

  it('admin filtra por userId', async () => {
    const userId = new UniqueEntityId();
    await repo.create(makeAdoptionCandidate({ userId }));
    await repo.create(makeAdoptionCandidate());

    const result = await sut.execute({
      requestingUser: adminUser,
      userId: userId.toString(),
      page: 1,
      limit: 25,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(1);
    }
  });

  it('admin filtra por isBanned', async () => {
    await repo.create(makeAdoptionCandidate({ isBanned: true }));
    await repo.create(makeAdoptionCandidate({ isBanned: false }));

    const result = await sut.execute({ requestingUser: adminUser, isBanned: true, page: 1, limit: 25 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(1);
    }
  });

  it('admin pagina corretamente', async () => {
    for (let i = 0; i < 5; i++) {
      await repo.create(makeAdoptionCandidate());
    }

    const page1 = await sut.execute({ requestingUser: adminUser, page: 1, limit: 3 });
    const page2 = await sut.execute({ requestingUser: adminUser, page: 2, limit: 3 });

    expect(page1.isRight()).toBe(true);
    expect(page2.isRight()).toBe(true);
    if (page1.isRight() && page2.isRight()) {
      expect(page1.value.candidates).toHaveLength(3);
      expect(page2.value.candidates).toHaveLength(2);
    }
  });
});
