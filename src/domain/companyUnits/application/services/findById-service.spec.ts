import { ServiceFindUnitById } from './findById-service';
import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { makeUnit } from '@/test/factories/makeUnit';

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceFindUnitById;

describe('buscar Units pelo id', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceFindUnitById(inMemoryRepositoriesUnits);
  });

  it('deve achar uma unidade com base no id ', async () => {
    const unit = makeUnit({});
    await inMemoryRepositoriesUnits.create(unit);

    const result = await sut.execute({
      id: unit.id.toString(),
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.unit.id).toEqual(unit.id);
    }
  });
});
