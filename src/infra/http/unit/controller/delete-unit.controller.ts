import { Controller, Delete, ForbiddenException, HttpCode, NotFoundException, Param } from '@nestjs/common';
import { ServicedeleteUnit } from '@/domain/companyUnits/application/services/delete-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteUnitDocs } from '../docs/unit.docs';

@ApiTags('Units')
@ApiBearerAuth('JWT')
@Controller('/units')
export class ControllerDeleteUnit {
  constructor(private deleteUnit: ServicedeleteUnit) {}

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @DeleteUnitDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.deleteUnit.execute({ actor, id });

    if (result.isLeft()) {
      if (result.value instanceof UnauthorizedError) throw new ForbiddenException(result.value.message);
      throw new NotFoundException(result.value.message);
    }
  }
}
