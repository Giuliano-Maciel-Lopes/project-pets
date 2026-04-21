import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ServiceDeletePets } from '@/domain/pets/application/services/delete-service-pets';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/pets')
export class ControllerDeletePet {
  constructor(private deletePet: ServiceDeletePets) {}

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.deletePet.execute({ id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
