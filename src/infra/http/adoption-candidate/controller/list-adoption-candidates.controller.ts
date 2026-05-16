import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { ServiceListAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/list-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import {
  listAdoptionCandidatesSchema,
  ListAdoptionCandidatesInput,
} from '../schemas/list-adoption-candidates-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/infra/auth/current-user.decorator';

@Controller('/adoption-candidates')
export class ControllerListAdoptionCandidates {
  constructor(private listCandidates: ServiceListAdoptionCandidate) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(listAdoptionCandidatesSchema))
    query: ListAdoptionCandidatesInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const result = await this.listCandidates.execute({
      ...query,
      requestingUser: user,
    });

    if (result.isLeft()) {
      throw new ForbiddenException(result.value.message);
    }

    const { candidates, total, page, limit } = result.value;
    return {
      candidates: candidates.map(AdoptionCandidatePresenter.toHTTP),
      total,
      page,
      limit,
    };
  }
}
