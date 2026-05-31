import { Public } from '@/infra/auth/public';
import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LogoutDocs } from '../docs/user.docs';

@ApiTags('Auth')
@Controller('/users')
export class ControllerLogout {
  @Post('logout')
  @Public()
  @LogoutDocs()
  handle(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logout realizado com sucesso' };
  }
}
