import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindUserById } from '@/domain/account/application/services/find-by-id-service';
import { UserPresenter } from '../presenters/user-presenter';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/users')
export class ControllerFindUserById {
  constructor(private findUserById: ServiceFindUserById) {}

  @Get(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.findUserById.execute(id);

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
