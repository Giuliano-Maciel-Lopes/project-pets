import { UseCaseError } from '@/core/erros/use-case-error';

export class UnauthorizedOwnershipError extends Error implements UseCaseError {
  constructor() {
    super('Você só pode visualizar seus próprios dados.');
  }
}
