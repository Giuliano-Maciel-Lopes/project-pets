import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '../env/env.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookie = req?.headers?.cookie;
          if (!cookie) return null;
          const match = cookie.match(/access_token=([^;]+)/);
          return match ? match[1] : null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: Buffer.from(env.get('JWT_PUBLIC_KEY'), 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, role: payload.role };
  }
}