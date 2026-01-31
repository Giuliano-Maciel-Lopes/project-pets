import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  AccountcreateSchema,
  CreateAccountInput,
} from '../schemas/create-user-schema';
import { ZodValidationPipe } from '../../pipes/zod-pipes';

@Controller('/users')
export class ControllerCreateAccount {
  constructor(private prisma: PrismaService) {}
  @Post()
  @UsePipes(new ZodValidationPipe(AccountcreateSchema))
  async handle(@Body() body: CreateAccountInput) {
    const { email, name, password } = body;

    const user = await this.prisma.user.create({
      data: { email, name, password },
    });

    return {
      message: 'Usuário criado com sucesso',
      user,
    };
  }
}
