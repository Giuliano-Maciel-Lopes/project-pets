import { Either, right } from '@/core/either';
import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';
import { RepositoriesAdoption } from '../../repositories/adoption';
//interface ListAdoptionServiceRequest {}

type ListAdoptionServiceResponse = Either<null, { adoptions: Adoption[] }>;

export class ServiceListAdoption {
  constructor(private repositoriesAdoptions: RepositoriesAdoption) {}

  async execute(): Promise<ListAdoptionServiceResponse> {
    const adoptions = await this.repositoriesAdoptions.list();

    return right({ adoptions });
  }
}
