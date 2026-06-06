import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceUpdateAdoptionCandidate } from './update-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceUpdateAdoptionCandidate;

const adminActor = { id: 'admin-id', role: Role.ADMIN };

describe('ServiceUpdateAdoptionCandidate', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate =
      new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceUpdateAdoptionCandidate(
      inMemoryRepositoriesAdoptionCandidate,
    );
  });

  it('admin pode atualizar qualquer candidato', async () => {
    const adoptionCandidate = makeAdoptionCandidate({
      name: 'Giuliano',
      phone: '11999999999',
      identityUrl: 'http://url-inicial.com',
      cpf: CPF.fromRaw('12345678909'),
    });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      actor: adminActor,
      id: adoptionCandidate.id.toString(),
      name: 'Giuliano Atualizado',
      phone: '11988888888',
      identityUrl: 'http://url-atualizada.com',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.adoptionCandidate.name).toBe('Giuliano Atualizado');
      expect(result.value.adoptionCandidate.phone).toBe('11988888888');
    }
  });

  it('adopter pode atualizar seu próprio candidato', async () => {
    const ownerId = new UniqueEntityId('owner-id');
    const adoptionCandidate = makeAdoptionCandidate({
      userId: ownerId,
      cpf: CPF.fromRaw('12345678909'),
    });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      actor: { id: 'owner-id', role: Role.ADOPTER },
      id: adoptionCandidate.id.toString(),
      name: 'Novo Nome',
      phone: '11988888888',
      identityUrl: 'http://url-nova.com',
    });

    expect(result.isRight()).toBe(true);
  });

  it('adopter não pode atualizar candidato de outra pessoa', async () => {
    const adoptionCandidate = makeAdoptionCandidate({
      userId: new UniqueEntityId('dono-id'),
      cpf: CPF.fromRaw('12345678909'),
    });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      actor: { id: 'outro-id', role: Role.ADOPTER },
      id: adoptionCandidate.id.toString(),
      name: 'Tentativa',
      phone: '11900000000',
      identityUrl: 'http://url.com',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando candidato não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
      name: 'Nome',
      phone: '11900000000',
      identityUrl: 'http://url.com',
    });

    expect(result.isLeft()).toBe(true);
  });
});
