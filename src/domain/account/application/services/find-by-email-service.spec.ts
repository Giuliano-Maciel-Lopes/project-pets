import { InMemoryRepositoriesUser } from '@/test/repositories/in-memory-user';
import { ServiceFindUserByEmail } from './find-by-email-service';
import { makeUser } from '@/test/factories/makeUser';
import { Role } from '@/domain/account/enterprise/entities/users';

const adminActor = { id: 'admin-01', role: Role.ADMIN };
const adopterActor = { id: 'adopter-01', role: Role.ADOPTER };

let repo: InMemoryRepositoriesUser;
let sut: ServiceFindUserByEmail;

describe('ServiceFindUserByEmail', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesUser();
    sut = new ServiceFindUserByEmail(repo);
  });

  it('deve retornar o usuário pelo email quando o ator é ADMIN', async () => {
    const user = makeUser({ email: 'test@email.com' });
    repo.items.push(user);

    const result = await sut.execute({ actor: adminActor, email: 'test@email.com' });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.email).toBe('test@email.com');
    }
  });

  it('deve retornar erro se o usuário não existir', async () => {
    const result = await sut.execute({ actor: adminActor, email: 'naoexiste@email.com' });

    expect(result.isLeft()).toBe(true);
  });

  it('deve retornar UnauthorizedError quando o ator é ADOPTER', async () => {
    const user = makeUser({ email: 'test@email.com' });
    repo.items.push(user);

    const result = await sut.execute({ actor: adopterActor, email: 'test@email.com' });

    expect(result.isLeft()).toBe(true);
  });
});
