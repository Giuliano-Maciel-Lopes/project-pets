import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { SelfOrAdminPolicy } from '@/core/police/self-or-admin-policy';

interface FindByIdAdoptionCandidateServiceRequest {
  actor: { id: string; role: Role };
  id: string;
}

type FindByIdAdoptionCandidateServiceResponse = Either<
  NotFoundError | UnauthorizedError,
  { adoptionCandidate: AdoptionCandidate }
>;

type CandidateOwnerContext = {
  actor: { id: string; role: Role };
  resourceOwnerId: string;
  candidate: AdoptionCandidate | null;
};

@Injectable()
export class ServiceFindByIdAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    id,
  }: FindByIdAdoptionCandidateServiceRequest): Promise<FindByIdAdoptionCandidateServiceResponse> {
    const candidate = await this.repositoriesAdoptionCandidate.findBy({ id });

    const context: CandidateOwnerContext = {
      actor,
      candidate,
      resourceOwnerId: candidate?.userId?.toString() ?? '',
    };

    const policyResult = await PolicyRunner.run<CandidateOwnerContext, NotFoundError | UnauthorizedError>(
      [
        new EntityMustExistPolicy('candidato', (ctx) => ctx.candidate),
        new SelfOrAdminPolicy(),
      ],
      context,
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    return right({ adoptionCandidate: candidate! });
  }
}
