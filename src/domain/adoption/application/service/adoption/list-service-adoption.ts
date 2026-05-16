import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoption,
  ListAdoptionFilters,
  PaginatedAdoptions,
} from '../../repositories/adoption';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { Role } from '@/domain/account/enterprise/entities/users';

interface RequestingUser {
  email: string;
  role: Role;
}

interface ListAdoptionServiceRequest extends ListAdoptionFilters {
  requestingUser: RequestingUser;
}

@Injectable()
export class ServiceListAdoption {
  constructor(
    private repositoriesAdoptions: RepositoriesAdoption,
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    requestingUser,
    ...filters
  }: ListAdoptionServiceRequest): Promise<PaginatedAdoptions> {
    if (requestingUser.role !== Role.ADMIN) {
      const candidate = await this.repositoriesAdoptionCandidate.findBy({
        email: requestingUser.email,
      });

      if (!candidate) {
        return { adoptions: [], total: 0, page: filters.page, limit: filters.limit };
      }

      filters.adopterId = candidate.id.toString();
    }

    return this.repositoriesAdoptions.list(filters);
  }
}
