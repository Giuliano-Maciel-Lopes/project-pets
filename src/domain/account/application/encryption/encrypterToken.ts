export abstract class EncrypterToken {
  abstract encryptToken(payload: Record<string, unknown>): Promise<string>;
}
