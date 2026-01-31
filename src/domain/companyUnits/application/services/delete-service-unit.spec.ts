import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { ServicedeleteUnit } from './delete-service-unit';
import { makeUnit } from '@/test/factories/makeUnit';

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServicedeleteUnit;

describe('Delete Units', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServicedeleteUnit(inMemoryRepositoriesUnits);
  });

  it('deve deletar uma unidade corretamente', async () => {
    const unit = makeUnit();

    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({ id: unit.id.toString() });

    const findUnit = await inMemoryRepositoriesUnits.findById(
      unit.id.toString(),
    );
    expect(result.isRight()).toBe(true);
    expect(findUnit).toBeNull();
  });
});
