import { Injectable } from '@nestjs/common';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { createUniqueUnitSlug } from '../../../../core/utils/createUniqueUnitSlug';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Either, left, right } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { Units } from '../../enterprise/entities/unity';

interface updateUnitServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  managerId: string;
}

type updateUnitServiceResponse = Either<NotFoundError | UnauthorizedError, null>;
type UnitContext = { actor: { id: string; role: Role }; unit: Units | null };

@Injectable()
export class ServiceUpdateUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    actor,
    id,
    address,
    city,
    managerId,
    name,
    state,
  }: updateUnitServiceRequest): Promise<updateUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);

    const policyResult = await PolicyRunner.run<UnitContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('unidade', (ctx) => ctx.unit),
      ],
      { actor, unit },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    const result = await createUniqueUnitSlug({
      name,
      repositoriesUnits: this.repositoriesUnits,
      entityName: 'unidade',
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    unit!.update({
      managerId: new UniqueEntityId(managerId),
      address,
      city,
      name,
      state,
    });

    return right(null);
  }
}
