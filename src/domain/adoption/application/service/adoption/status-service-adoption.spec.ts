import { makeAdoption } from '@/test/factories/makeAdoption';
import { InMemoryRepositoriesAdoption } from '@/test/repositories/in-memory-adoptions';
import { ServiceStatusAdoption } from './status-service-adoption';
import { AdoptionStatus } from '@/domain/adoption/enterprise/entities/adoption';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let sut: ServiceStatusAdoption;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceStatusAdoption', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();
    sut = new ServiceStatusAdoption(inMemoryRepositoriesAdoption);
  });

  it('admin pode atualizar o status de uma adoção', async () => {
    const adoption = makeAdoption({ status: AdoptionStatus.PENDING });
    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({
      actor: adminActor,
      id: adoption.id.toString(),
      status: AdoptionStatus.APPROVED,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(inMemoryRepositoriesAdoption.items[0]).toEqual(result.value.adoption);
      expect(result.value.adoption.status).equal(AdoptionStatus.APPROVED);
    }
  });

  it('adopter não pode atualizar status', async () => {
    const adoption = makeAdoption({ status: AdoptionStatus.PENDING });
    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({
      actor: adopterActor,
      id: adoption.id.toString(),
      status: AdoptionStatus.APPROVED,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando adoção não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
      status: AdoptionStatus.APPROVED,
    });

    expect(result.isLeft()).toBe(true);
  });
});
