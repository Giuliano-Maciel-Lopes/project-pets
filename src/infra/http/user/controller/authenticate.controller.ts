import { Body, Controller, Post, Res, UnauthorizedException, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { ServiceAuthenticateUser } from '@/domain/account/application/services/authenticate-service';
import { authenticateSchema, AuthenticateInput } from '../schemas/authenticate-schema';

@Controller('/sessions')
export class ControllerAuthenticate {
  constructor(private authenticate: ServiceAuthenticateUser) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateSchema))
  async handle(
    @Body() body: AuthenticateInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;

    const result = await this.authenticate.execute({ email, password });

    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message);
    }

    res.cookie('access_token', result.value.accesToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return { message: 'Autenticado com sucesso' };
  }
}
