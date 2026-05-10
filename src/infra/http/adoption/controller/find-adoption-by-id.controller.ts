import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindByIdAdoption } from '@/domain/adoption/application/service/adoption/findy-By-id-service';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoptions')
export class ControllerFindAdoptionById {
  constructor(private findAdoptionById: ServiceFindByIdAdoption) {}

  @Get(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.findAdoptionById.execute({ id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
