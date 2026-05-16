import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceCreateAdoptionCandidate } from './create-service-adoptionCandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedEmailError } from '@/domain/adoption/errro/unauthorizedEmailError';

let repo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceCreateAdoptionCandidate;

const adminUser = { id: 'admin-id', email: 'admin@pets.com', role: Role.ADMIN };
const adopterUser = { id: 'adopter-id', email: 'adopter@test.com', role: Role.ADOPTER };

describe('ServiceCreateAdoptionCandidate', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceCreateAdoptionCandidate(repo);
  });

  it('admin pode criar candidato com qualquer e-mail', async () => {
    const result = await sut.execute({
      requestingUser: adminUser,
      email: 'qualquer@email.com',
      name: 'Giuliano',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'http://url.com/foto.jpg',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(repo.items[0].email).toBe('qualquer@email.com');
      expect(repo.items[0].userId).toBeUndefined();
    }
  });

  it('adopter pode criar candidato com seu próprio e-mail e fica vinculado ao userId', async () => {
    const result = await sut.execute({
      requestingUser: adopterUser,
      email: adopterUser.email,
      name: 'Giuliano',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'http://url.com/foto.jpg',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(repo.items[0].email).toBe(adopterUser.email);
      expect(repo.items[0].userId?.toString()).toBe(adopterUser.id);
    }
  });

  it('adopter não pode criar candidato com e-mail diferente do seu', async () => {
    const result = await sut.execute({
      requestingUser: adopterUser,
      email: 'outra@pessoa.com',
      name: 'Giuliano',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'http://url.com/foto.jpg',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedEmailError);
  });
});
