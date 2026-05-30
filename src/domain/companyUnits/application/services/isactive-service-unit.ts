import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { Units } from '../../enterprise/entities/unity';

interface toggleActiveUnitServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  isActive: boolean;
}

type toggleActiveUnitServiceResponse = Either<NotFoundError | UnauthorizedError, null>;
type UnitContext = { actor: { id: string; role: Role }; unit: Units | null };

@Injectable()
export class ServicetoggleActiveUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    actor,
    id,
    isActive,
  }: toggleActiveUnitServiceRequest): Promise<toggleActiveUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);

    const policyResult = await PolicyRunner.run<UnitContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('unidade', (ctx) => ctx.unit),
      ],
      { actor, unit },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    unit!.setActive(isActive);
    await this.repositoriesUnits.toggleActive(id, isActive);

    return right(null);
  }
}
