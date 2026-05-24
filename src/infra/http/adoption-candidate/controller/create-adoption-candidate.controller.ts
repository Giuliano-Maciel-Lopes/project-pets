import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ServiceCreateAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/create-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import {
  createAdoptionCandidateSchema,
  CreateAdoptionCandidateInput,
} from '../schemas/create-adoption-candidate-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/infra/auth/current-user.decorator';
import { UnauthorizedEmailError } from '@/domain/adoption/errro/unauthorizedEmailError';

@Controller('/adoption-candidates')
export class ControllerCreateAdoptionCandidate {
  constructor(private createCandidate: ServiceCreateAdoptionCandidate) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAdoptionCandidateSchema))
    body: CreateAdoptionCandidateInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const { email, name, cpf, phone, identityUrl } = body;

    const result = await this.createCandidate.execute({
      requestingUser: user,
      email,
      name,
      cpf,
      phone,
      identityUrl,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new ForbiddenException(error.message);
    }

    return {
      adoptionCandidate: AdoptionCandidatePresenter.toHTTP(
        result.value.adoptioncandidate,
      ),
    };
  }
}
