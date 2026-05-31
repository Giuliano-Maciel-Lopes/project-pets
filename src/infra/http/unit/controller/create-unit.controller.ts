import { Body, ConflictException, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ServiceCreateUnit } from '@/domain/companyUnits/application/services/create-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { createUnitSchema, CreateUnitInput } from '../schemas/create-unit-schema';
import { UnitPresenter } from '../presenters/unit-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUnitDocs } from '../docs/unit.docs';

@ApiTags('Units')
@ApiBearerAuth('JWT')
@Controller('/units')
export class ControllerCreateUnit {
  constructor(private createUnit: ServiceCreateUnit) {}

  @Post()
  @Roles(Role.ADMIN)
  @CreateUnitDocs()
  async handle(@Body(new ZodValidationPipe(createUnitSchema)) body: CreateUnitInput, @CurrentUser() actor: CurrentUserPayload) {
    const { name, address, city, state, managerId } = body;

    const result = await this.createUnit.execute({ actor, name, address, city, state, managerId });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedError) throw new ForbiddenException(error.message);
      throw new ConflictException(error.message);
    }

    return { unit: UnitPresenter.toHTTP(result.value.unit) };
  }
}
