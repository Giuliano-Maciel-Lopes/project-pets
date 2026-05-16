import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '../env/env.service';
import { Request } from 'express';
import { RepositoriesUser } from '@/domain/account/application/repositories/repositoriesUser';

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    env: EnvService,
    private usersRepo: RepositoriesUser,
  ) {
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
    const user = await this.usersRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id.toString(), role: user.role, email: user.email };
  }
}