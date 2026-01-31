import { makePet } from '@/test/factories/makePet';
import { makeUnit } from '@/test/factories/makeUnit';
import { makePolicyContext } from '@/test/police/makePoliceConext';
import { UnitAndPetDistincsPolicy } from './PetAndUnitDestinctsPolicy';
import { UnitAndPetDistincsError } from '../errro/unitAndPetError';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

describe('Policy de Pet e Unidade Distintas', () => {
  let policy: UnitAndPetDistincsPolicy;

  beforeEach(() => {
    policy = new UnitAndPetDistincsPolicy();
  });

  it('deve retornar erro se o pet não pertence à unidade', () => {
    const unidade = makeUnit({}, new UniqueEntityId('1'));
    const pet = makePet({ unitId: new UniqueEntityId('2') });

    const resultado = policy.validate(
      makePolicyContext({ pet, unit: unidade }),
    );

    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(UnitAndPetDistincsError);
  });

  it('deve retornar certo (void) se o pet pertence à unidade', () => {
    const unidade = makeUnit({}, new UniqueEntityId('1'));
    const pet = makePet({ unitId: new UniqueEntityId('1') });

    const resultado = policy.validate(
      makePolicyContext({ pet, unit: unidade }),
    );

    expect(resultado.isRight()).toBe(true);
    expect(resultado.value).toBeUndefined();
  });
});
