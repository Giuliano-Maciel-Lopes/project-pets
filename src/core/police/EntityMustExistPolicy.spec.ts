import { EntityMustExistPolicy } from './EntityMustExistPolicy';
import { NotFoundError } from '../erros/erro/not-found-items';
import { makePet } from '@/test/factories/makePet';
import { Pets } from '@/domain/pets/enterprise/entity/pets';

type PetContext = { pet: Pets | null };

describe('Policy: EntityMustExistPolicy', () => {
  let policy: EntityMustExistPolicy<PetContext, Pets>;

  beforeEach(() => {
    policy = new EntityMustExistPolicy<PetContext, Pets>('Pet', (ctx) => ctx.pet);
  });

  it('deve retornar erro se a entidade NÃO existir', () => {
    const resultado = policy.validate({ pet: null });

    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(NotFoundError);
    expect((resultado.value as NotFoundError).message).toContain('Pet');
  });

  it('deve passar se a entidade existir', () => {
    const pet = makePet();
    const resultado = policy.validate({ pet });

    expect(resultado.isRight()).toBe(true);
    expect(resultado.value).toBeUndefined();
  });
});
