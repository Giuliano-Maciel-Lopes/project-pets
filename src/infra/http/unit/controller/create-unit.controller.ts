import {
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ServiceCreateUnit } from '@/domain/companyUnits/application/services/create-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { createUnitSchema, CreateUnitInput } from '../schemas/create-unit-schema';
import { UnitPresenter } from '../presenters/unit-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/units')
export class ControllerCreateUnit {
  constructor(private createUnit: ServiceCreateUnit) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(createUnitSchema))
  async handle(@Body() body: CreateUnitInput) {
    const { name, address, city, state, managerId } = body;

    const result = await this.createUnit.execute({
      name,
      address,
      city,
      state,
      managerId,
    });

    if (result.isLeft()) {
      throw new ConflictException(result.value.message);
    }

    return { unit: UnitPresenter.toHTTP(result.value.unit) };
  }
}
