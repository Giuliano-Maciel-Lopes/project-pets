import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ServicetoggleActiveUnit } from '@/domain/companyUnits/application/services/isactive-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { toggleActiveUnitSchema, ToggleActiveUnitInput } from '../schemas/toggle-active-unit-schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/units')
export class ControllerToggleActiveUnit {
  constructor(private toggleActiveUnit: ServicetoggleActiveUnit) {}

  @Patch(':id/active')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(toggleActiveUnitSchema)) body: ToggleActiveUnitInput,
  ) {
    const result = await this.toggleActiveUnit.execute({
      id,
      isActive: body.isActive,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { message: 'Status da unidade atualizado com sucesso' };
  }
}
