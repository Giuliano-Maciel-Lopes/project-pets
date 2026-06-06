import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import {
  AdoptionCandidate,
  AdoptionCandidateProps,
} from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';

export function makeCandidate(
  override: Partial<AdoptionCandidateProps> = {},
  id?: UniqueEntityId,
) {
  const candidate = AdoptionCandidate.create(
    {
      email: 'candidato@test.com',
      cpf: CPF.fromRaw('12345678909'),
      identityUrl: 'https://fake.identity/url.jpg',
      name: 'Candidato Teste',
      phone: '(11) 99999-9999',
      isBanned: false,
      ...override,
    },
    id,
  );

  return candidate;
}
