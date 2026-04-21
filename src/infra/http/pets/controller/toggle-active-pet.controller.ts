import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ServiceIsActivePets } from '@/domain/pets/application/services/isActive-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { toggleActivePetSchema, ToggleActivePetInput } from '../schemas/toggle-active-pet-schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/pets')
export class ControllerToggleActivePet {
  constructor(private toggleActivePet: ServiceIsActivePets) {}

  @Patch(':id/active')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(toggleActivePetSchema)) body: ToggleActivePetInput,
  ) {
    const result = await this.toggleActivePet.execute({
      id,
      isActive: body.isActive,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { message: 'Status do pet atualizado com sucesso' };
  }
}
