import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindUnitBySlug } from '@/domain/companyUnits/application/services/findBySlug-service';
import { UnitPresenter } from '../presenters/unit-presenter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindUnitBySlugDocs } from '../docs/unit.docs';

@ApiTags('Units')
@ApiBearerAuth('JWT')
@Controller('/units')
export class ControllerFindUnitBySlug {
  constructor(private findUnitBySlug: ServiceFindUnitBySlug) {}

  @Get('slug/:slug')
  @FindUnitBySlugDocs()
  async handle(@Param('slug') slug: string) {
    const result = await this.findUnitBySlug.execute({ slug });

    if (result.isLeft()) throw new NotFoundException(result.value.message);

    return { unit: UnitPresenter.toHTTP(result.value.unit) };
  }
}
