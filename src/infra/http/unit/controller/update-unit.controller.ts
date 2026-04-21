import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { ServiceUpdateUnit } from '@/domain/companyUnits/application/services/update-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { updateUnitSchema, UpdateUnitInput } from '../schemas/update-unit-schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/units')
export class ControllerUpdateUnit {
  constructor(private updateUnit: ServiceUpdateUnit) {}

  @Put(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(updateUnitSchema)) body: UpdateUnitInput,
  ) {
    const { name, address, city, state, managerId } = body;

    const result = await this.updateUnit.execute({
      id,
      name,
      address,
      city,
      state,
      managerId,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('não encontrado')) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }

    return { message: 'Unidade atualizada com sucesso' };
  }
}
