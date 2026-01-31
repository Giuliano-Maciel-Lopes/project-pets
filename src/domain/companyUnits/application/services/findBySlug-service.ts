import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { Units } from '../../enterprise/entities/unity';
import { RepositoriesUnits } from '../repositories/unistsRepositories';
import { Either, left, right } from '@/core/either';

interface FindBySlugUnitServiceRequest {
  slug: string;
}

type FindBySlugUnitServiceResponse = Either<
  NotFoundError,
  {
    unit: Units;
  }
>;

export class ServiceFindUnitBySlug {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    slug,
  }: FindBySlugUnitServiceRequest): Promise<FindBySlugUnitServiceResponse> {
    const unit = await this.repositoriesUnits.findBySlug(slug);

    if (!unit) {
      return left(new NotFoundError('unidade'));
    }

    return right({ unit });
  }
}
