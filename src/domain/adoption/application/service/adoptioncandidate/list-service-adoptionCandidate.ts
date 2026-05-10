import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoptionCandidate,
  ListAdoptionCandidateFilters,
  PaginatedAdoptionCandidates,
} from '../../repositories/adoptioncandidate';

@Injectable()
export class ServiceListAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute(
    filters: ListAdoptionCandidateFilters,
  ): Promise<PaginatedAdoptionCandidates> {
    return this.repositoriesAdoptionCandidate.list(filters);
  }
}
