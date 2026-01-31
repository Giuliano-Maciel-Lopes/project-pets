import { UseCaseError } from '@/core/erros/use-case-error';

export class ExystUserWitchEmailError extends Error implements UseCaseError {
  constructor() {
    super('Já existe um usuario com esse email !! faça loguin ');
  }
}
