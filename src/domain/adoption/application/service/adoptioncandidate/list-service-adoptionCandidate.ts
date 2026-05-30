import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoptionCandidate,
  ListAdoptionCandidateFilters,
  PaginatedAdoptionCandidates,
} from '../../repositories/adoptioncandidate';
import { Either, left, right } from '@/core/either';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';

interface ListAdoptionCandidateServiceRequest extends ListAdoptionCandidateFilters {
  actor: { id: string; role: Role };
}

type ListAdoptionCandidateServiceResponse = Either<
  UnauthorizedError,
  PaginatedAdoptionCandidates
>;

@Injectable()
export class ServiceListAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    ...filters
  }: ListAdoptionCandidateServiceRequest): Promise<ListAdoptionCandidateServiceResponse> {
    const policyResult = await PolicyRunner.run(
      [new RequiredRolePolicy([Role.ADMIN])],
      { actor },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    const result = await this.repositoriesAdoptionCandidate.list(filters);
    return right(result);
  }
}
