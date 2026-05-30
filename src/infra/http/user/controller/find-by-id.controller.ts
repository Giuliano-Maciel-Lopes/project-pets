import { Controller, ForbiddenException, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindUserById } from '@/domain/account/application/services/find-by-id-service';
import { UserPresenter } from '../presenters/user-presenter';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/users')
export class ControllerFindUserById {
  constructor(private findUserById: ServiceFindUserById) {}

  @Get(':id')
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.findUserById.execute({ actor, id });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new NotFoundException(result.value.message);
    }

    return { user: UserPresenter.toHTTP(result.value.user) };
  }
}
