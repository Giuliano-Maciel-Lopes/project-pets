import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { ServiceUpdatePets } from '@/domain/pets/application/services/update-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { updatePetSchema, UpdatePetInput } from '../schemas/update-pet-schema';
import { PetPresenter } from '../presenters/pet-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PetSex } from '@/domain/pets/enterprise/entity/pets';

@Controller('/pets')
export class ControllerUpdatePet {
  constructor(private updatePet: ServiceUpdatePets) {}

  @Put(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(updatePetSchema)) body: UpdatePetInput,
  ) {
    const result = await this.updatePet.execute({
      id,
      ...body,
      sex: body.sex as PetSex | undefined,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { pet: PetPresenter.toHTTP(result.value.pet) };
  }
}
