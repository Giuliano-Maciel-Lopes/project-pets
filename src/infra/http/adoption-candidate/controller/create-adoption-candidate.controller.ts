import { Body, ConflictException, Controller, HttpCode, Post, UnprocessableEntityException } from '@nestjs/common';
import { ServiceCreateAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/create-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { createAdoptionCandidateSchema, CreateAdoptionCandidateInput } from '../schemas/create-adoption-candidate-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import { CurrentUser, CurrentUserPayload } from '@/infra/auth/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAdoptionCandidateDocs } from '../docs/adoption-candidate.docs';
import { DuplicateCandidateError } from '@/domain/adoption/errro/duplicateCandidateError';

@ApiTags('Adoption Candidates')
@ApiBearerAuth('JWT')
@Controller('/adoption-candidates')
export class ControllerCreateAdoptionCandidate {
  constructor(private createCandidate: ServiceCreateAdoptionCandidate) {}

  @Post()
  @HttpCode(201)
  @CreateAdoptionCandidateDocs()
  async handle(
    @Body(new ZodValidationPipe(createAdoptionCandidateSchema)) body: CreateAdoptionCandidateInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const { email, name, cpf, phone, identityUrl } = body;

    const result = await this.createCandidate.execute({ actor, email, name, cpf, phone, identityUrl });

    if (result.isLeft()) {
      if (result.value instanceof DuplicateCandidateError) throw new ConflictException(result.value.message);
      throw new UnprocessableEntityException(result.value.message);
    }

    return {
      adoptionCandidate: AdoptionCandidatePresenter.toHTTP(result.value.adoptioncandidate),
    };
  }
}
