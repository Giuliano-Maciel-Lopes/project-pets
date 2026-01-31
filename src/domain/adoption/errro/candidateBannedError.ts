import { UseCaseError } from '@/core/erros/use-case-error';

export class CandidateBannedError extends Error implements UseCaseError {
  constructor() {
    super('O candidato encontra-se bloqueado para o processo de adoção.');
  }
}
