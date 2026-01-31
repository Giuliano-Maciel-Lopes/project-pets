import { UseCaseError } from '../use-case-error';

export class NotFoundError extends Error implements UseCaseError {
  constructor(entityName: string) {
    super(`${entityName} não encontrado`);
  }
}
