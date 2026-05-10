import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ServiceStatusAdoption } from '@/domain/adoption/application/service/adoption/status-service-adoption';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import {
  statusAdoptionSchema,
  StatusAdoptionInput,
} from '../schemas/status-adoption-schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoptions')
export class ControllerStatusAdoption {
  constructor(private statusAdoption: ServiceStatusAdoption) {}

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(statusAdoptionSchema)) body: StatusAdoptionInput,
  ) {
    const result = await this.statusAdoption.execute({ id, status: body.status });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
