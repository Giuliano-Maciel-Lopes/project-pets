import { CandidateBannedError } from '../errro/candidateBannedError';
import { CandidateMustNotBeBannedPolicy } from './CantidadeIsBannedPolicy';
import { makeCandidate } from '@/test/factories/makeCandidate';
import { makePolicyContext } from '@/test/police/makePoliceConext';

describe('Policy de Candidato Banido', () => {
  let policy: CandidateMustNotBeBannedPolicy;

  beforeEach(() => {
    policy = new CandidateMustNotBeBannedPolicy();
  });

  it('deve retornar erro se o candidato estiver banido', () => {
    const candidate = makeCandidate({ isBanned: true });

    const resultado = policy.validate(makePolicyContext({ candidate }));

    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(CandidateBannedError);
  });

  it('deve passar se o candidato NÃO estiver banido', () => {
    const candidate = makeCandidate({ isBanned: false });

    const resultado = policy.validate(makePolicyContext({ candidate }));

    expect(resultado.isRight()).toBe(true);
    expect(resultado.value).toBeUndefined();
  });
});
