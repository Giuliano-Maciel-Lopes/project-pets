import {
  Body,
  Controller,
  ForbiddenException,
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
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/pets')
export class ControllerSetStatusPet {
  constructor(private setStatusPet: ServiceSetStatusPets) {}

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(setStatusPetSchema)) body: SetStatusPetInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.setStatusPet.execute({
      actor,
      id,
      status: body.status as PetStatus,
    });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new NotFoundException(result.value.message);
    }

    return { message: 'Status do pet atualizado com sucesso' };
  }
}
