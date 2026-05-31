import { Body, Controller, ForbiddenException, NotFoundException, Param, Patch } from '@nestjs/common';
import { ServiceIsActivePets } from '@/domain/pets/application/services/isActive-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { toggleActivePetSchema, ToggleActivePetInput } from '../schemas/toggle-active-pet-schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ToggleActivePetDocs } from '../docs/pets.docs';

@ApiTags('Pets')
@ApiBearerAuth('JWT')
@Controller('/pets')
export class ControllerToggleActivePet {
  constructor(private toggleActivePet: ServiceIsActivePets) {}

  @Patch(':id/active')
  @Roles(Role.ADMIN)
  @ToggleActivePetDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(toggleActivePetSchema)) body: ToggleActivePetInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.toggleActivePet.execute({ actor, id, isActive: body.isActive });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) throw new ForbiddenException(result.value.message);
      throw new NotFoundException(result.value.message);
    }

    return { message: 'Status do pet atualizado com sucesso' };
  }
}
