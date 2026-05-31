import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindUnitById } from '@/domain/companyUnits/application/services/findById-service';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { UnitPresenter } from '../presenters/unit-presenter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindUnitByIdDocs } from '../docs/unit.docs';

@ApiTags('Units')
@ApiBearerAuth('JWT')
@Controller('/units')
export class ControllerFindUnitById {
  constructor(private findUnitById: ServiceFindUnitById) {}

  @Get(':id')
  @FindUnitByIdDocs()
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.findUnitById.execute({ id });

    if (result.isLeft()) throw new NotFoundException(result.value.message);

    return { unit: UnitPresenter.toHTTP(result.value.unit) };
  }
}
