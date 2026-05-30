import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { ServicetoggleActiveUnit } from './isactive-service-unit';
import { makeUnit } from '@/test/factories/makeUnit';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

const adminActor = { id: 'admin-01', role: Role.ADMIN };
const adopterActor = { id: 'adopter-01', role: Role.ADOPTER };

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServicetoggleActiveUnit;

describe('toggleactive Units', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServicetoggleActiveUnit(inMemoryRepositoriesUnits);
  });

  it('deve verificar se a unidade mudou o campo IsActive', async () => {
    const unit = makeUnit({ isActive: true });
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({
      actor: adminActor,
      id: unit.id.toString(),
      isActive: false,
    });

    const updatedUnit = await inMemoryRepositoriesUnits.findById(unit.id.toString());
    expect(result.isRight()).toBe(true);
    expect(updatedUnit!.isActive).toEqual(false);
  });

  it('deve retornar UnauthorizedError quando o ator é ADOPTER', async () => {
    const unit = makeUnit({ isActive: true });
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({
      actor: adopterActor,
      id: unit.id.toString(),
      isActive: false,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });
});
