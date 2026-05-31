import { Body, Controller, ForbiddenException, NotFoundException, Param, Patch } from '@nestjs/common';
import { ServiceStatusAdoption } from '@/domain/adoption/application/service/adoption/status-service-adoption';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { statusAdoptionSchema, StatusAdoptionInput } from '../schemas/status-adoption-schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusAdoptionDocs } from '../docs/adoption.docs';

@ApiTags('Adoptions')
@ApiBearerAuth('JWT')
@Controller('/adoptions')
export class ControllerStatusAdoption {
  constructor(private statusAdoption: ServiceStatusAdoption) {}

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @StatusAdoptionDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(statusAdoptionSchema)) body: StatusAdoptionInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.statusAdoption.execute({ actor, id, status: body.status });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) throw new ForbiddenException(result.value.message);
      throw new NotFoundException(result.value.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
