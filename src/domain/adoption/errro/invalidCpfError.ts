import { UseCaseError } from '@/core/erros/use-case-error';

export class InvalidCpfError extends Error implements UseCaseError {
  constructor() {
    super('CPF inválido.');
  }
}
