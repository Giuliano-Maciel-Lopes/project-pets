export class CPF {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): CPF {
    const normalized = value.replace(/\D/g, '');

    if (!CPF.isValid(normalized)) {
      throw new Error('CPF inválido');
    }

    return new CPF(normalized);
  }

  /**
   * Receives a string and normalize it as a CPF.
   *
   * Example: "123.456.789-09" => "12345678909"
   *
   * @param text {string}
   */
  static createFromText(text: string): CPF {
    const normalized = text.replace(/\D/g, '');

    if (!CPF.isValid(normalized)) {
      throw new Error('CPF inválido');
    }

    return new CPF(normalized);
  }

  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    // validação simples (pode evoluir depois)
    return true;
  }
}
