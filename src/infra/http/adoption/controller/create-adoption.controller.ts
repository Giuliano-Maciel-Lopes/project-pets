import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ServiceCreateAdoption } from '@/domain/adoption/application/service/adoption/create-service-adoption';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import {
  createAdoptionSchema,
  CreateAdoptionInput,
} from '../schemas/create-adoption-schema';
import { AdoptionPresenter } from '../presenters/adoption-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';
import { AdoptionStatus } from '@/domain/adoption/enterprise/entities/adoption';

@Controller('/adoptions')
export class ControllerCreateAdoption {
  constructor(private createAdoption: ServiceCreateAdoption) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAdoptionSchema)) body: CreateAdoptionInput,
  ) {
    const { petId, adopterId, unityId } = body;

    const result = await this.createAdoption.execute({
      petId,
      adopterId,
      unityId,
      status: AdoptionStatus.PENDING,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes('bloqueado')) {
        throw new ForbiddenException(error.message);
      }
      throw new UnprocessableEntityException(error.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
