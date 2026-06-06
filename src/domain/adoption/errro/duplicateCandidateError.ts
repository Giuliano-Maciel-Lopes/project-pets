import { UseCaseError } from '@/core/erros/use-case-error';

export class DuplicateCandidateError extends Error implements UseCaseError {
  constructor() {
    super('Já existe um candidato cadastrado com esse email ou CPF.');
  }
}
