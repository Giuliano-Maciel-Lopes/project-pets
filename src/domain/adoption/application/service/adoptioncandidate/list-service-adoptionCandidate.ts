import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoptionCandidate,
  ListAdoptionCandidateFilters,
  PaginatedAdoptionCandidates,
} from '../../repositories/adoptioncandidate';
import { Either, left, right } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedOwnershipError } from '@/domain/adoption/errro/unauthorizedOwnershipError';

interface RequestingUser {
  email: string;
  role: Role;
}

interface ListAdoptionCandidateServiceRequest extends ListAdoptionCandidateFilters {
  requestingUser: RequestingUser;
}

type ListAdoptionCandidateServiceResponse = Either<
  UnauthorizedOwnershipError,
  PaginatedAdoptionCandidates
>;

@Injectable()
export class ServiceListAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    requestingUser,
    ...filters
  }: ListAdoptionCandidateServiceRequest): Promise<ListAdoptionCandidateServiceResponse> {
    if (requestingUser.role !== Role.ADMIN) {
      return left(new UnauthorizedOwnershipError());
    }

    const result = await this.repositoriesAdoptionCandidate.list(filters);
    return right(result);
  }
}
