import { HashComparer } from "@/domain/account/application/encryption/hash-comparer";
import { HashGenerator } from "@/domain/account/application/encryption/hash-generator";

export class FakeHash implements HashGenerator, HashComparer {
  async hash(passPlain: string): Promise<string> {
    return passPlain.concat("_hashed");
  }

  async compare(passPlain: string, hash: string): Promise<boolean> {
    return passPlain.concat("_hashed") === hash;
  }
}
