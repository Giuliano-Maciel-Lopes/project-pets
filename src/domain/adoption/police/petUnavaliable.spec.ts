import { PetUnavailblePolicy } from './petUnavaliable';
import { PetStatus } from '@/domain/pets/enterprise/entity/pets';
import { petUnavaliableError } from '../errro/petUnavaliableError';
import { makePet } from '@/test/factories/makePet';
import { makePolicyContext } from '@/test/police/makePoliceConext';

describe('Policy de Pet Indisponível', () => {
  let policy: PetUnavailblePolicy;

  beforeEach(() => {
    policy = new PetUnavailblePolicy();
  });

  it('deve retornar erro se o pet NÃO estiver disponível', () => {
    const pet = makePet({
      status: PetStatus.UNAVAILABLE,
    });

    const resultado = policy.validate(makePolicyContext({ pet }));

    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(petUnavaliableError);
  });

  it('deve retornar certo (void) se o pet estiver DISPONÍVEL', () => {
    const pet = makePet({
      status: PetStatus.AVAILABLE,
    });

    const resultado = policy.validate(makePolicyContext({ pet }));

    expect(resultado.isRight()).toBe(true);
    expect(resultado.value).toBeUndefined();
  });
});
