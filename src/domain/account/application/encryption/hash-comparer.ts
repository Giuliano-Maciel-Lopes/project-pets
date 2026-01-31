export abstract class HashComparer {
  abstract compare(passPlain: string, hash: string): Promise<boolean>;
}
