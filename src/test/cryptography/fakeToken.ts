import { EncrypterToken } from '@/domain/account/application/encryption/encrypterToken';

export class FakeToken implements EncrypterToken {
  async encryptToken(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }
}
