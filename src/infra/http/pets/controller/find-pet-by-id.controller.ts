import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindByIdPets } from '@/domain/pets/application/services/findById-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { PetPresenter } from '../presenters/pet-presenter';

@Controller('/pets')
export class ControllerFindPetById {
  constructor(private findPetById: ServiceFindByIdPets) {}

  @Get(':id')
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.findPetById.execute({ id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { pet: PetPresenter.toHTTP(result.value.pet) };
  }
}
