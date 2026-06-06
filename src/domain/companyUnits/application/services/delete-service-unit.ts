import { Injectable } from '@nestjs/common';
import { RepositoriesUnits } from '../repositories/unitsRepositories';
import { Either, left, right } from '@/core/either';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { Units } from '../../enterprise/entities/unity';

interface deleteUnitServiceRequest {
  actor: { id: string; role: Role };
  id: string;
}

type deleteUnitServiceResponse = Either<NotFoundError | UnauthorizedError, null>;
type UnitContext = { actor: { id: string; role: Role }; unit: Units | null };

@Injectable()
export class ServiceDeleteUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    actor,
    id,
  }: deleteUnitServiceRequest): Promise<deleteUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);

    const policyResult = await PolicyRunner.run<UnitContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('unidade', (ctx) => ctx.unit),
      ],
      { actor, unit },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    await this.repositoriesUnits.delete(unit!.id.toString());

    return right(null);
  }
}
