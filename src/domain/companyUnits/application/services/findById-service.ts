import { Injectable } from '@nestjs/common';
import { left, right } from '@/core/either';
import { Units } from '../../enterprise/entities/unity';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Either } from '@/core/either';

interface FindByIdUnitServiceRequest {
  id: string;
}

type FindByIdUnitServiceResponse = Either<
  NotFoundError,
  {
    unit: Units;
  }
>;

@Injectable()
export class ServiceFindUnitById {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    id,
  }: FindByIdUnitServiceRequest): Promise<FindByIdUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);

    if (!unit) {
      return left(new NotFoundError('unidade'));
    }

    return right({ unit });
  }
}
