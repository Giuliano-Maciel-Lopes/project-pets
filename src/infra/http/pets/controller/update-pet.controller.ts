import { Body, Controller, ForbiddenException, NotFoundException, Param, Put } from '@nestjs/common';
import { ServiceUpdatePets } from '@/domain/pets/application/services/update-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { updatePetSchema, UpdatePetInput } from '../schemas/update-pet-schema';
import { PetPresenter } from '../presenters/pet-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PetSex } from '@/domain/pets/enterprise/entity/pets';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdatePetDocs } from '../docs/pets.docs';

@ApiTags('Pets')
@ApiBearerAuth('JWT')
@Controller('/pets')
export class ControllerUpdatePet {
  constructor(private updatePet: ServiceUpdatePets) {}

  @Put(':id')
  @Roles(Role.ADMIN)
  @UpdatePetDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(updatePetSchema)) body: UpdatePetInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.updatePet.execute({ actor, id, ...body, sex: body.sex as PetSex | undefined });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) throw new ForbiddenException(result.value.message);
      throw new NotFoundException(result.value.message);
    }

    return { pet: PetPresenter.toHTTP(result.value.pet) };
  }
}
