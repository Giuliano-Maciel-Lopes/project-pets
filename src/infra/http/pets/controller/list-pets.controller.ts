import { Controller, Get, Query } from '@nestjs/common';
import { ServiceListPets } from '@/domain/pets/application/services/list-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { listPetsSchema, ListPetsInput } from '../schemas/list-pets-schema';
import { PetPresenter } from '../presenters/pet-presenter';
import { PetStatus, PetSex } from '@/domain/pets/enterprise/entity/pets';

@Controller('/pets')
export class ControllerListPets {
  constructor(private listPets: ServiceListPets) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(listPetsSchema)) query: ListPetsInput,
  ) {
    const result = await this.listPets.execute({
      ...query,
      status: query.status as PetStatus | undefined,
      sex: query.sex as PetSex | undefined,
    });

    return {
      pets: result.pets.map(PetPresenter.toHTTP),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
