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

@Controller('/adoption-candidates')
export class ControllerCreateAdoptionCandidate {
  constructor(private createCandidate: ServiceCreateAdoptionCandidate) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createAdoptionCandidateSchema))
    body: CreateAdoptionCandidateInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const { email, name, cpf, phone, identityUrl } = body;

    const result = await this.createCandidate.execute({
      actor,
      email,
      name,
      cpf,
      phone,
      identityUrl,
    });

    return {
      adoptionCandidate: AdoptionCandidatePresenter.toHTTP(
        result.value.adoptioncandidate,
      ),
    };
  }
}
