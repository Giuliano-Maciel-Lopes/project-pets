import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { RepositoriesUnits } from '../repositories/unistsRepositories';

import { NotFoundError } from '@/core/erros/erro/not-found-items';

interface toggleActiveUnitServiceRequest {
  id: string;
  isActive: boolean;
}

type toggleActiveUnitServiceResponse = Either<NotFoundError, null>;

@Injectable()
export class ServicetoggleActiveUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    id,
    isActive,
  }: toggleActiveUnitServiceRequest): Promise<toggleActiveUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findById(id);
    if (!unit) {
      return left(new NotFoundError('unidade'));
    }

    unit.setActive(isActive);
    await this.repositoriesUnits.toggleActive(id, isActive);

    return right(null);
  }
}
