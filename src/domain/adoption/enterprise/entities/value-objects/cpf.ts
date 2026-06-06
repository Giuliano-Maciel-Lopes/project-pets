import { Either, left, right } from '@/core/either';
import { InvalidCpfError } from '@/domain/adoption/errro/invalidCpfError';

export class CPF {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Either<InvalidCpfError, CPF> {
    const normalized = value.replace(/\D/g, '');

    if (!CPF.isValid(normalized)) {
      return left(new InvalidCpfError());
    }

    return right(new CPF(normalized));
  }

  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    return true;
  }
}
