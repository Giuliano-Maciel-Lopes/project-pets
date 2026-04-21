import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ServicedeleteUnit } from '@/domain/companyUnits/application/services/delete-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/units')
export class ControllerDeleteUnit {
  constructor(private deleteUnit: ServicedeleteUnit) {}

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.deleteUnit.execute({ id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }
  }
}
