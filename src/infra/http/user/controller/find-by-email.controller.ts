import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { ServiceFindUserByEmail } from '@/domain/account/application/services/find-by-email-service';
import { UserPresenter } from '../presenters/user-presenter';

@Controller('/users')
export class ControllerFindUserByEmail {
  constructor(private findUserByEmail: ServiceFindUserByEmail) {}

  @Get('email/:email')
  @Roles(Role.ADMIN)
  async handle(@Param('email') email: string) {
    const result = await this.findUserByEmail.execute(email);

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
