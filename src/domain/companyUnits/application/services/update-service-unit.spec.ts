import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { ServiceUpdateUnit } from './update-service-unit';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { makeUnit } from '@/test/factories/makeUnit';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

const adminActor = { id: 'admin-01', role: Role.ADMIN };
const adopterActor = { id: 'adopter-01', role: Role.ADOPTER };

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceUpdateUnit;

describe('UPDATE Units', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceUpdateUnit(inMemoryRepositoriesUnits);
  });

  it('Deve fazer update e slug mudar também', async () => {
    const unit = makeUnit({ name: 'Unidade teste' });
    await inMemoryRepositoriesUnits.create(unit);

    const updateData = {
      actor: adminActor,
      id: unit.id.toString(),
      name: 'Unidade Atualizada',
      address: 'Rua B, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      managerId: new UniqueEntityId().toString(),
    };

    const result = await sut.execute(updateData);

    const updatedUnit = await inMemoryRepositoriesUnits.findById(unit.id.toString());

    expect(result.isRight()).toBe(true);
    expect(updatedUnit).toBeDefined();
    expect(updatedUnit!.name).toBe(updateData.name);
    expect(updatedUnit!.address).toBe(updateData.address);
    expect(updatedUnit!.city).toBe(updateData.city);
    expect(updatedUnit!.state).toBe(updateData.state);
    expect(updatedUnit!.managerId.toString()).toBe(updateData.managerId);
    expect(updatedUnit!.slug.value).toBe('unidade-atualizada');
  });

  it('deve retornar UnauthorizedError quando o ator é ADOPTER', async () => {
    const unit = makeUnit({ name: 'Unidade teste' });
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({
      actor: adopterActor,
      id: unit.id.toString(),
      name: 'Tentativa',
      address: 'Rua X',
      city: 'SP',
      state: 'SP',
      managerId: new UniqueEntityId().toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });
});
