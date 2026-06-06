import { InMemoryRepositoriesUser } from '@/test/repositories/in-memory-user';
import { ServiceFindUserById } from './find-by-id-service';
import { makeUser } from '@/test/factories/makeUser';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';

const adminActor = { id: 'admin-01', role: Role.ADMIN };

let repo: InMemoryRepositoriesUser;
let sut: ServiceFindUserById;

describe('ServiceFindUserById', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesUser();
    sut = new ServiceFindUserById(repo);
  });

  it('deve retornar o usuário pelo id quando o ator é ADMIN', async () => {
    const user = makeUser({}, new UniqueEntityId('user-id-01'));
    repo.items.push(user);

    const result = await sut.execute({ actor: adminActor, id: 'user-id-01' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.id).toBe('user-id-01');
    }
  });

  it('não expõe a senha no retorno', async () => {
    const user = makeUser({}, new UniqueEntityId('user-id-safe'));
    repo.items.push(user);

    const result = await sut.execute({ actor: adminActor, id: 'user-id-safe' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user).not.toHaveProperty('password');
    }
  });

  it('deve retornar o usuário quando o ADOPTER busca o próprio id', async () => {
    const user = makeUser({}, new UniqueEntityId('user-id-02'));
    repo.items.push(user);

    const ownerActor = { id: 'user-id-02', role: Role.ADOPTER };
    const result = await sut.execute({ actor: ownerActor, id: 'user-id-02' });

    expect(result.isRight()).toBe(true);
  });

  it('deve retornar UnauthorizedError quando ADOPTER tenta buscar id de outro usuário', async () => {
    const user = makeUser({}, new UniqueEntityId('user-id-03'));
    repo.items.push(user);

    const strangerActor = { id: 'outro-user', role: Role.ADOPTER };
    const result = await sut.execute({ actor: strangerActor, id: 'user-id-03' });

    expect(result.isLeft()).toBe(true);
  });

  it('deve retornar erro se o usuário não existir', async () => {
    const result = await sut.execute({ actor: adminActor, id: 'id-inexistente' });

    expect(result.isLeft()).toBe(true);
  });
});
