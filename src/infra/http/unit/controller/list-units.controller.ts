import { Controller, Get, Query } from '@nestjs/common';
import { ServiceListUnits } from '@/domain/companyUnits/application/services/zlist-service-unit';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { listUnitsSchema, ListUnitsInput } from '../schemas/list-units-schema';
import { UnitPresenter } from '../presenters/unit-presenter';

@Controller('/units')
export class ControllerListUnits {
  constructor(private listUnits: ServiceListUnits) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(listUnitsSchema)) query: ListUnitsInput,
  ) {
    const result = await this.listUnits.execute(query);

    return {
      units: result.units.map(UnitPresenter.toHTTP),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
