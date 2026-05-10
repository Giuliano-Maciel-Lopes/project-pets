import { Controller, Get, Query } from '@nestjs/common';
import { ServiceListAdoption } from '@/domain/adoption/application/service/adoption/list-service-adoption';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import {
  listAdoptionsSchema,
  ListAdoptionsInput,
} from '../schemas/list-adoptions-schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoptions')
export class ControllerListAdoptions {
  constructor(private listAdoptions: ServiceListAdoption) {}

  @Get()
  @Roles(Role.ADMIN)
  async handle(
    @Query(new ZodValidationPipe(listAdoptionsSchema)) query: ListAdoptionsInput,
  ) {
    const result = await this.listAdoptions.execute(query);
    return {
      adoptions: result.adoptions.map(AdoptionPresenter.toHTTP),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
