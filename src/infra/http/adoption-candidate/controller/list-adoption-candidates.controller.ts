import {
  Controller,
  ForbiddenException,
  Get,
  Query,
} from '@nestjs/common';
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
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/adoption-candidates')
export class ControllerListAdoptionCandidates {
  constructor(private listCandidates: ServiceListAdoptionCandidate) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(listAdoptionCandidatesSchema))
    query: ListAdoptionCandidatesInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const result = await this.listCandidates.execute({ ...query, actor });

    if (result.isLeft()) {
      throw new ForbiddenException(
        result.value instanceof UnauthorizedError
          ? result.value.message
          : 'Acesso negado',
      );
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
