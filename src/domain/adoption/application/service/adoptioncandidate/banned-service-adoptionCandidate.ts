import { Injectable } from '@nestjs/common';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';

interface BannedAdoptionCandidateServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  isBanned: boolean;
  bannedReason: string;
}

type BannedAdoptionCandidateServiceResponse = Either<
  NotFoundError | UnauthorizedError,
  { adoptionCandidate: AdoptionCandidate }
>;

type CandidateContext = { actor: { id: string; role: Role }; candidate: AdoptionCandidate | null };

@Injectable()
export class ServiceBannedAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    id,
    bannedReason,
    isBanned,
  }: BannedAdoptionCandidateServiceRequest): Promise<BannedAdoptionCandidateServiceResponse> {
    const candidate = await this.repositoriesAdoptionCandidate.findBy({ id });

    const policyResult = await PolicyRunner.run<CandidateContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('candidato', (ctx) => ctx.candidate),
      ],
      { actor, candidate },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    candidate!.banned({ isBanned, bannedReason });
    await this.repositoriesAdoptionCandidate.setBlock(candidate!);

    return right({ adoptionCandidate: candidate! });
  }
}
