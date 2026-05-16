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
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/infra/auth/current-user.decorator';
import { AdoptionStatus } from '@/domain/adoption/enterprise/entities/adoption';
import { UnauthorizedEmailError } from '@/domain/adoption/errro/unauthorizedEmailError';

@Controller('/adoptions')
export class ControllerCreateAdoption {
  constructor(private createAdoption: ServiceCreateAdoption) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAdoptionSchema)) body: CreateAdoptionInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const { petId, adopterId, unityId } = body;

    const result = await this.createAdoption.execute({
      petId,
      adopterId,
      unityId,
      status: AdoptionStatus.PENDING,
      requestingUser: user,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedEmailError) {
        throw new ForbiddenException(error.message);
      }
      if (error.message.includes('bloqueado')) {
        throw new ForbiddenException(error.message);
      }
      throw new UnprocessableEntityException(error.message);
    }

    return { adoption: AdoptionPresenter.toHTTP(result.value.adoption) };
  }
}
