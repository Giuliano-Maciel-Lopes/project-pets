import { Controller, Delete, ForbiddenException, HttpCode, NotFoundException, Param } from '@nestjs/common';
import { ServiceDeletePets } from '@/domain/pets/application/services/delete-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeletePetDocs } from '../docs/pets.docs';

@ApiTags('Pets')
@ApiBearerAuth('JWT')
@Controller('/pets')
export class ControllerDeletePet {
  constructor(private deletePet: ServiceDeletePets) {}

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @DeletePetDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.deletePet.execute({ actor, id });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) throw new ForbiddenException(result.value.message);
      throw new NotFoundException(result.value.message);
    }
  }
}
