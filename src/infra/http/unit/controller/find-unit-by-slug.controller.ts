import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindUnitBySlug } from '@/domain/companyUnits/application/services/findBySlug-service';
import { UnitPresenter } from '../presenters/unit-presenter';

@Controller('/units')
export class ControllerFindUnitBySlug {
  constructor(private findUnitBySlug: ServiceFindUnitBySlug) {}

  @Get('slug/:slug')
  async handle(@Param('slug') slug: string) {
    const result = await this.findUnitBySlug.execute({ slug });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { unit: UnitPresenter.toHTTP(result.value.unit) };
  }
}
