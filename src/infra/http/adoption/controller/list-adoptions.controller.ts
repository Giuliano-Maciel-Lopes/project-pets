import { Controller, Get, Query } from '@nestjs/common';
import { ServiceListAdoption } from '@/domain/adoption/application/service/adoption/list-service-adoption';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { listAdoptionsSchema, ListAdoptionsInput } from '../schemas/list-adoptions-schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListAdoptionsDocs } from '../docs/adoption.docs';

@ApiTags('Adoptions')
@ApiBearerAuth('JWT')
@Controller('/adoptions')
export class ControllerListAdoptions {
  constructor(private listAdoptions: ServiceListAdoption) {}

  @Get()
  @ListAdoptionsDocs()
  async handle(
    @Query(new ZodValidationPipe(listAdoptionsSchema)) query: ListAdoptionsInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const result = await this.listAdoptions.execute({ ...query, actor: user });

    return {
      adoptions: result.adoptions.map(AdoptionPresenter.toHTTP),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
