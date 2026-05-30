import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ServiceCreatePets } from '@/domain/pets/application/services/create-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { createPetSchema, CreatePetInput } from '../schemas/create-pet-schema';
import { PetPresenter } from '../presenters/pet-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PetSex } from '@/domain/pets/enterprise/entity/pets';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/pets')
export class ControllerCreatePet {
  constructor(private createPet: ServiceCreatePets) {}

  @Post()
  @Roles(Role.ADMIN)
  async handle(@Body(new ZodValidationPipe(createPetSchema)) body: CreatePetInput, @CurrentUser() actor: CurrentUserPayload) {
    const result = await this.createPet.execute({
      actor,
      ...body,
      sex: body.sex as PetSex | undefined,
    });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw result.value;
    }

    return { pet: PetPresenter.toHTTP(result.value.pet) };
  }
}
