import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ServiceCreatePets } from '@/domain/pets/application/services/create-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { createPetSchema, CreatePetInput } from '../schemas/create-pet-schema';
import { PetPresenter } from '../presenters/pet-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/pets')
export class ControllerCreatePet {
  constructor(private createPet: ServiceCreatePets) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(createPetSchema))
  async handle(@Body() body: CreatePetInput) {
    const result = await this.createPet.execute(body);

    if (result.isLeft()) {
      throw result.value;
    }

    return { pet: PetPresenter.toHTTP(result.value.pet) };
  }
}
