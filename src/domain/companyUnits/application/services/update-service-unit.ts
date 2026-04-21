import { Injectable } from '@nestjs/common';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { createUniqueUnitSlug } from '../../../../core/utils/createUniqueUnitSlug';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Either, left, right } from '@/core/either';

interface updateUnitServiceRequest {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  managerId: string;
}

type updateUnitServiceResponse = Either<NotFoundError, null>;

@Injectable()
export class ServiceUpdateUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    id,
    address,
    city,
    managerId,
    name,
    state,
  }: updateUnitServiceRequest): Promise<updateUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);

    if (!unit) {
      return left(new NotFoundError('unidade'));
    }

    const result = await createUniqueUnitSlug({
      name,
      repositoriesUnits: this.repositoriesUnits,
      entityName: 'unidade',
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    unit.update({
      managerId: new UniqueEntityId(managerId),
      address,
      city,
      name,
      state,
    });

    return right(null);
  }
}
