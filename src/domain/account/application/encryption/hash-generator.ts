export abstract class HashGenerator {
  abstract hash(passPlain: string): Promise<string>;
}
