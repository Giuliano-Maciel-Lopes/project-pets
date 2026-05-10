import { Controller, Get } from '@nestjs/common';
import { ServiceListAdoption } from '@/domain/adoption/application/service/adoption/list-service-adoption';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoptions')
export class ControllerListAdoptions {
  constructor(private listAdoptions: ServiceListAdoption) {}

  @Get()
  @Roles(Role.ADMIN)
  async handle() {
    const result = await this.listAdoptions.execute();
    return {
      adoptions: result.value!.adoptions.map(AdoptionPresenter.toHTTP),
    };
  }
}
