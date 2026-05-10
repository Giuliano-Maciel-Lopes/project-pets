import { Controller, Get, Query } from '@nestjs/common';
import { ServiceListAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/list-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import {
  listAdoptionCandidatesSchema,
  ListAdoptionCandidatesInput,
} from '../schemas/list-adoption-candidates-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoption-candidates')
export class ControllerListAdoptionCandidates {
  constructor(private listCandidates: ServiceListAdoptionCandidate) {}

  @Get()
  @Roles(Role.ADMIN)
  async handle(
    @Query(new ZodValidationPipe(listAdoptionCandidatesSchema))
    query: ListAdoptionCandidatesInput,
  ) {
    const result = await this.listCandidates.execute(query);
    return {
      candidates: result.candidates.map(AdoptionCandidatePresenter.toHTTP),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
