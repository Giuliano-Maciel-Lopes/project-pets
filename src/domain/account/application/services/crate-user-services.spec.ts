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
    const result = await sut.execute({
      name: 'Giuliano',
      email: 'giuliano@test.com',
      password: 'senha',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryRepositoriesUser.items).toHaveLength(1);
    expect(inMemoryRepositoriesUser.items[0].email).toBe('giuliano@test.com');
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
