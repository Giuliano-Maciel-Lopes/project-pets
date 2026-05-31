import { Body, ConflictException, Controller, Post, UsePipes } from '@nestjs/common';
import { Public } from '@/infra/auth/public';
import { ServiceCreateUser } from '@/domain/account/application/services/crate-user-service';
import { AccountcreateSchema, CreateAccountInput } from '../schemas/create-user-schema';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDocs } from '../docs/user.docs';

@ApiTags('Users')
@Controller('/users')
export class ControllerCreateAccount {
  constructor(private createUser: ServiceCreateUser) {}

  @Post()
  @Public()
  @UsePipes(new ZodValidationPipe(AccountcreateSchema))
  @CreateUserDocs()
  async handle(@Body() body: CreateAccountInput) {
    const { email, name, password } = body;

    const result = await this.createUser.execute({ email, name, password });

    if (result.isLeft()) {
      throw new ConflictException(result.value.message);
    }

    return { message: 'Usuário criado com sucesso' };
  }
}
