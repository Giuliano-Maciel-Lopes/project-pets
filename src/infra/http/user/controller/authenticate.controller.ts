import { Body, Controller, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '@/infra/auth/public';
import { Response } from 'express';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { ServiceAuthenticateUser } from '@/domain/account/application/services/authenticate-service';
import { authenticateSchema, AuthenticateInput } from '../schemas/authenticate-schema';
import { EnvService } from '@/infra/env/env.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticateDocs } from '../docs/user.docs';

@ApiTags('Auth')
@Controller('/sessions')
export class ControllerAuthenticate {
  constructor(
    private authenticate: ServiceAuthenticateUser,
    private envService: EnvService,
  ) {}

  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @AuthenticateDocs()
  async handle(
    @Body(new ZodValidationPipe(authenticateSchema)) body: AuthenticateInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;

    const result = await this.authenticate.execute({ email, password });

    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message);
    }

    res.cookie('access_token', result.value.accesToken, {
      httpOnly: true,
      secure: this.envService.get('COOKIE_SECURE'),
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return { message: 'Autenticado com sucesso', accessToken: result.value.accesToken };
  }
}
