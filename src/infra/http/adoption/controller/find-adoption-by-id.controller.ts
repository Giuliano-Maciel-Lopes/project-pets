import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ServiceFindByIdAdoption } from '@/domain/adoption/application/service/adoption/findy-By-id-service';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/adoptions')
export class ControllerFindAdoptionById {
  constructor(private findAdoptionById: ServiceFindByIdAdoption) {}

  @Get(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.findAdoptionById.execute({ actor, id });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new NotFoundException(result.value.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
