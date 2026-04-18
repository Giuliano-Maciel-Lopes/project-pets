import { InMemoryRepositoriesUser } from '@/test/repositories/in-memory-user';
import { ServiceFindUserByEmail } from './find-by-email-service';
import { makeUser } from '@/test/factories/makeUser';

let repo: InMemoryRepositoriesUser;
let sut: ServiceFindUserByEmail;

describe('ServiceFindUserByEmail', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesUser();
    sut = new ServiceFindUserByEmail(repo);
  });

  it('deve retornar o usuário pelo email', async () => {
    const user = makeUser({ email: 'test@email.com' });
    repo.items.push(user);

    const result = await sut.execute('test@email.com');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.email).toBe('test@email.com');
    }
  });

  it('deve retornar erro se o usuário não existir', async () => {
    const result = await sut.execute('naoexiste@email.com');

    expect(result.isLeft()).toBe(true);
  });
});
