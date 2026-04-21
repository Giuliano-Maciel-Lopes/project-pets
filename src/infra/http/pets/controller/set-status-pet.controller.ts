import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ServiceSetStatusPets } from '@/domain/pets/application/services/setStatus-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { setStatusPetSchema, SetStatusPetInput } from '../schemas/set-status-pet-schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PetStatus } from '@/domain/pets/enterprise/entity/pets';

@Controller('/pets')
export class ControllerSetStatusPet {
  constructor(private setStatusPet: ServiceSetStatusPets) {}

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(setStatusPetSchema)) body: SetStatusPetInput,
  ) {
    const result = await this.setStatusPet.execute({
      id,
      status: body.status as PetStatus,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { message: 'Status do pet atualizado com sucesso' };
  }
}
