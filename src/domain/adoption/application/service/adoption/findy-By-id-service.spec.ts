import { makeAdoption } from '@/test/factories/makeAdoption';
import { InMemoryRepositoriesAdoption } from '@/test/repositories/in-memory-adoptions';
import { ServiceFindByIdAdoption } from './findy-By-id-service';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let sut: ServiceFindByIdAdoption;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceFindByIdAdoption', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();
    sut = new ServiceFindByIdAdoption(inMemoryRepositoriesAdoption);
  });

  it('admin pode buscar uma adoção por id', async () => {
    const adoption = makeAdoption();
    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({
      actor: adminActor,
      id: adoption.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(inMemoryRepositoriesAdoption.items[0]).toEqual(result.value.adoption);
    }
  });

  it('adopter não pode buscar adoção por id', async () => {
    const adoption = makeAdoption();
    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({
      actor: adopterActor,
      id: adoption.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando adoção não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
    });

    expect(result.isLeft()).toBe(true);
  });
});
