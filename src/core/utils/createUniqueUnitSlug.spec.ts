import { InMemoryRepositoriesUnits } from '@/test/repositories/in-memory-units';
import { createUniqueUnitSlug } from '@/core/utils/createUniqueUnitSlug';
import { makeUnit } from '@/test/factories/makeUnit';
import { DuplicateSlugNameError } from '../erros/erro/duplicateEntity';

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;

describe('createUniqueUnitSlug', () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
  });

  it('deve retornar erro se já existir uma unidade com o mesmo slug', async () => {
    const unit = makeUnit({ name: 'Unidade Teste' });
    await inMemoryRepositoriesUnits.create(unit);

    const result = await createUniqueUnitSlug({
      entityName: 'unidade',
      name: 'Unidade Teste',
      repositoriesUnits: inMemoryRepositoriesUnits,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(DuplicateSlugNameError);
      expect(result.value.message).toContain('unidade');
    }
  });
});
