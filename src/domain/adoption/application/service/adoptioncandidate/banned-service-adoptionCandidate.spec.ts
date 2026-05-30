import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceBannedAdoptionCandidate } from './banned-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceBannedAdoptionCandidate;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceBannedAdoptionCandidate', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate =
      new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceBannedAdoptionCandidate(
      inMemoryRepositoriesAdoptionCandidate,
    );
  });

  it('admin pode banir um candidato', async () => {
    const adoptionCandidate = makeAdoptionCandidate({ isBanned: false });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      actor: adminActor,
      id: adoptionCandidate.id.toString(),
      bannedReason: 'usuario foi banido devido a desrepeito com funcionario',
      isBanned: true,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.adoptionCandidate.isBanned).toBe(true);
      expect(result.value.adoptionCandidate.bannedReason).toBe(
        'usuario foi banido devido a desrepeito com funcionario',
      );
    }
  });

  it('adopter não pode banir candidato', async () => {
    const adoptionCandidate = makeAdoptionCandidate({ isBanned: false });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      actor: adopterActor,
      id: adoptionCandidate.id.toString(),
      bannedReason: 'tentativa',
      isBanned: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando candidato não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
      bannedReason: 'motivo',
      isBanned: true,
    });

    expect(result.isLeft()).toBe(true);
  });
});
