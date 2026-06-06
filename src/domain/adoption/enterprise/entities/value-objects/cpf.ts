import { Either, left, right } from '@/core/either';
import { InvalidCpfError } from '@/domain/adoption/errro/invalidCpfError';

export class CPF {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromRaw(value: string): CPF {
    return new CPF(value);
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

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf[10]);
  }
}
