import { UseCaseError } from '@/core/erros/use-case-error';

export class UnauthorizedEmailError extends Error implements UseCaseError {
  constructor() {
    super('Você só pode criar registros com seu próprio e-mail.');
  }
}
