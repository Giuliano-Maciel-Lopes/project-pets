import { Either, left, right } from '@/core/either';
import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { RepositoriesAdoption } from '../../repositories/adoption';
interface FindByIdAdoptionServiceRequest {
  id: string;
}

type FindByIdAdoptionServiceResponse = Either<
  NotFoundError,
  { adoption: Adoption }
>;

export class ServiceFindByIdAdoption {
  constructor(private repositoriesAdoptions: RepositoriesAdoption) {}

  async execute({
    id,
  }: FindByIdAdoptionServiceRequest): Promise<FindByIdAdoptionServiceResponse> {
    const adoption = await this.repositoriesAdoptions.findById(id);

    if (!adoption) {
      return left(new NotFoundError('adoption'));
    }

    return right({ adoption });
  }
}
