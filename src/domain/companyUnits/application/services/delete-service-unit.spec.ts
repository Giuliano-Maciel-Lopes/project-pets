import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { ServiceDeleteUnit } from './delete-service-unit';
import { makeUnit } from '@/test/factories/makeUnit';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

const adminActor = { id: 'admin-01', role: Role.ADMIN };
const adopterActor = { id: 'adopter-01', role: Role.ADOPTER };

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceDeleteUnit;

describe('Delete Units', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceDeleteUnit(inMemoryRepositoriesUnits);
  });

  it('deve deletar uma unidade corretamente', async () => {
    const unit = makeUnit();
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({ actor: adminActor, id: unit.id.toString() });

    const findUnit = await inMemoryRepositoriesUnits.findById(unit.id.toString());
    expect(result.isRight()).toBe(true);
    expect(findUnit).toBeNull();
  });

  it('deve retornar UnauthorizedError quando o ator é ADOPTER', async () => {
    const unit = makeUnit();
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({ actor: adopterActor, id: unit.id.toString() });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });
});
