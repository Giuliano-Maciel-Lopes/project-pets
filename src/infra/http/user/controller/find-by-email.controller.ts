import { Controller, ForbiddenException, Get, NotFoundException, Param } from '@nestjs/common';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { ServiceFindUserByEmail } from '@/domain/account/application/services/find-by-email-service';
import { UserPresenter } from '../presenters/user-presenter';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindUserByEmailDocs } from '../docs/user.docs';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('/users')
export class ControllerFindUserByEmail {
  constructor(private findUserByEmail: ServiceFindUserByEmail) {}

  @Get('email/:email')
  @Roles(Role.ADMIN)
  @FindUserByEmailDocs()
  async handle(
    @Param('email') email: string,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.findUserByEmail.execute({ actor, email });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new NotFoundException(result.value.message);
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
