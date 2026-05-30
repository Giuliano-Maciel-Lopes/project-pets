import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceCreateAdoptionCandidate } from './create-service-adoptionCandidate';
import { Role } from '@/domain/account/enterprise/entities/users';

let repo: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceCreateAdoptionCandidate;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceCreateAdoptionCandidate', () => {
  beforeEach(() => {
    repo = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceCreateAdoptionCandidate(repo);
  });

  it('admin pode criar candidato sem vínculo de userId', async () => {
    const result = await sut.execute({
      actor: adminActor,
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

  it('adopter cria candidato e fica vinculado ao seu userId', async () => {
    const result = await sut.execute({
      actor: adopterActor,
      email: 'adopter@test.com',
      name: 'Giuliano',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'http://url.com/foto.jpg',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(repo.items[0].userId?.toString()).toBe(adopterActor.id);
    }
  });
});
