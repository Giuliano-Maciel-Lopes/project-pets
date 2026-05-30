import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { RepositoriesAdoption } from '../../repositories/adoption';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';

interface FindByIdAdoptionServiceRequest {
  actor: { id: string; role: Role };
  id: string;
}

type FindByIdAdoptionServiceResponse = Either<
  NotFoundError | UnauthorizedError,
  { adoption: Adoption }
>;

type AdoptionContext = { actor: { id: string; role: Role }; adoption: Adoption | null };

@Injectable()
export class ServiceFindByIdAdoption {
  constructor(private repositoriesAdoptions: RepositoriesAdoption) {}

  async execute({
    actor,
    id,
  }: FindByIdAdoptionServiceRequest): Promise<FindByIdAdoptionServiceResponse> {
    const adoption = await this.repositoriesAdoptions.findById(id);

    const policyResult = await PolicyRunner.run<AdoptionContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('adoption', (ctx) => ctx.adoption),
      ],
      { actor, adoption },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    return right({ adoption: adoption! });
  }
}
