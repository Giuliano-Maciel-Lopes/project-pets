import { Injectable } from '@nestjs/common';
import { EncrypterToken } from '@/domain/account/application/encryption/encrypterToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtEncrypter implements EncrypterToken {
  constructor(private jwtService: JwtService) {}

  encryptToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
