import { InMemoryRepositoriesUser } from '@/test/repositories/in-memory-user';
import { ServiceCreateUser } from './crate-user-service';
import { FakeHash } from '@/test/cryptography/fakehash';

let inMemoryRepositoriesUser: InMemoryRepositoriesUser;
let sut: ServiceCreateUser;
let fakeHash: FakeHash;

describe(' User Service', () => {
  beforeEach(() => {
    inMemoryRepositoriesUser = new InMemoryRepositoriesUser();
    fakeHash = new FakeHash();
    sut = new ServiceCreateUser(inMemoryRepositoriesUser, fakeHash);
  });

  it('deve criar um usuario corretamente', async () => {
    const userData = {
      name: 'Giuliano',
      email: 'giulianomaciellopes@gmail.com',
      password: 'senha',
    };

    const result = await sut.execute(userData);

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const user = result.value.user;

      expect(user.id).toBeTruthy();
      expect(inMemoryRepositoriesUser.items[0]).toEqual(user);
    }
  });

  it('deve criar um hash  em uma  nova senha ', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    const hashedPassword = await fakeHash.hash('123456');

    expect(result.isRight()).toBe(true);
    expect(inMemoryRepositoriesUser.items[0].password).toEqual(hashedPassword);
  });
});
