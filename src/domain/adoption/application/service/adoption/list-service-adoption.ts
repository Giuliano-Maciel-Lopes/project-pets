import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoption,
  ListAdoptionFilters,
  PaginatedAdoptions,
} from '../../repositories/adoption';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { Role } from '@/domain/account/enterprise/entities/users';

interface ListAdoptionServiceRequest extends ListAdoptionFilters {
  actor: { id: string; role: Role };
}

@Injectable()
export class ServiceListAdoption {
  constructor(
    private repositoriesAdoptions: RepositoriesAdoption,
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    ...filters
  }: ListAdoptionServiceRequest): Promise<PaginatedAdoptions> {
    if (actor.role !== Role.ADMIN) {
      const candidate = await this.repositoriesAdoptionCandidate.findBy({
        userId: actor.id,
      });

      if (!candidate) {
        return { adoptions: [], total: 0, page: filters.page, limit: filters.limit };
      }

      filters.adopterId = candidate.id.toString();
    }

    return this.repositoriesAdoptions.list(filters);
  }
}
