import { Injectable } from '@nestjs/common';
import { createUniqueUnitSlug } from '../../../../core/utils/createUniqueUnitSlug';
import { Units } from '../../enterprise/entities/unity';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Either } from '@/core/either';
import { DuplicateSlugNameError } from '@/core/erros/erro/duplicateEntity';
import { right, left } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';

interface CreateUnitServiceRequest {
  actor: { id: string; role: Role };
  name: string;
  address: string;
  city: string;
  state: string;
  managerId: string;
}

type CreateUnitServiceResponse = Either<
  DuplicateSlugNameError | UnauthorizedError,
  { unit: Units }
>;

@Injectable()
export class ServiceCreateUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    actor,
    address,
    city,
    managerId,
    name,
    state,
  }: CreateUnitServiceRequest): Promise<CreateUnitServiceResponse> {
    const policyResult = await PolicyRunner.run(
      [new RequiredRolePolicy([Role.ADMIN])],
      { actor },
    );

    if (policyResult.isLeft()) return left(policyResult.value);
    const slugResult = await createUniqueUnitSlug({
      entityName: 'unidade',
      name,
      repositoriesUnits: this.repositoriesUnits,
    });

    if (slugResult.isLeft()) {
      return left(slugResult.value); // aqui retorna o erro
    }

    const unit = Units.create({
      address,
      city,
      managerId: new UniqueEntityId(managerId),
      name,
      state,
      slug: slugResult.value, // aqui retorna o slug
    });

    await this.repositoriesUnits.create(unit);

    return right({ unit });
  }
}
