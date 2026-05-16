import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedOwnershipError } from '@/domain/adoption/errro/unauthorizedOwnershipError';

interface RequestingUser {
  email: string;
  role: Role;
}

interface FindByIdAdoptionCandidateServiceRequest {
  id: string;
  requestingUser: RequestingUser;
}

type FindByIdAdoptionCandidateServiceResponse = Either<
  NotFoundError | UnauthorizedOwnershipError,
  { adoptionCandidate: AdoptionCandidate }
>;

@Injectable()
export class ServiceFindByIdAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    id,
    requestingUser,
  }: FindByIdAdoptionCandidateServiceRequest): Promise<FindByIdAdoptionCandidateServiceResponse> {
    const adoptionCandidate =
      await this.repositoriesAdoptionCandidate.findBy({ id });

    if (!adoptionCandidate) {
      return left(new NotFoundError('adoptioncanditate'));
    }

    if (
      requestingUser.role !== Role.ADMIN &&
      adoptionCandidate.email !== requestingUser.email
    ) {
      return left(new UnauthorizedOwnershipError());
    }

    return right({ adoptionCandidate });
  }
}
