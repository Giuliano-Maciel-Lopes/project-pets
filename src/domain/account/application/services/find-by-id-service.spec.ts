import { InMemoryRepositoriesUser } from '@/test/repositories/in-memory-user';
import { ServiceFindUserById } from './find-by-id-service';
import { makeUser } from '@/test/factories/makeUser';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let repo: InMemoryRepositoriesUser;
let sut: ServiceFindUserById;

describe('ServiceFindUserById', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesUser();
    sut = new ServiceFindUserById(repo);
  });

  it('deve retornar o usuário pelo id', async () => {
    const user = makeUser({}, new UniqueEntityId('user-id-01'));
    repo.items.push(user);

    const result = await sut.execute('user-id-01');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.id.toString()).toBe('user-id-01');
    }
  });

  it('deve retornar erro se o usuário não existir', async () => {
    const result = await sut.execute('id-inexistente');

    expect(result.isLeft()).toBe(true);
  });
});
