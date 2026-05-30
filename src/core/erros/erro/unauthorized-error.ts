import { UseCaseError } from '@/core/erros/use-case-error';

export class UnauthorizedError extends Error implements UseCaseError {
  constructor() {
    super('Sem permissão para executar esta operação.');
  }
}
