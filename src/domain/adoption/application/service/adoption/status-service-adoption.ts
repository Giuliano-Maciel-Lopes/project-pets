import { Either, left, right } from '@/core/either';
import {
  Adoption,
  AdoptionStatus,
} from '@/domain/adoption/enterprise/entities/adoption';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { RepositoriesAdoption } from '../../repositories/adoption';
interface StatusAdoptionServiceRequest {
  id: string;
  status: AdoptionStatus;
}

type StatusAdoptionServiceResponse = Either<
  NotFoundError,
  { adoption: Adoption }
>;

export class ServiceStatusAdoption {
  constructor(private repositoriesAdoptions: RepositoriesAdoption) {}

  async execute({
    id,
    status,
  }: StatusAdoptionServiceRequest): Promise<StatusAdoptionServiceResponse> {
    const adoption = await this.repositoriesAdoptions.findById(id);

    if (!adoption) {
      return left(new NotFoundError('adoption'));
    }
    adoption.setStatus(status);

    await this.repositoriesAdoptions.update(adoption);

    return right({ adoption });
  }
}
