import { AdoptionCandidate } from '../../enterprise/entities/adoptionCandidate';

export interface ListAdoptionCandidateFilters {
  userId?: string;
  name?: string;
  cpf?: string;
  isBanned?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedAdoptionCandidates {
  candidates: AdoptionCandidate[];
  total: number;
  page: number;
  limit: number;
}

export abstract class RepositoriesAdoptionCandidate {
  abstract findBy(criteria: { id?: string; email?: string; cpf?: string }): Promise<AdoptionCandidate | null>;
  abstract create(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract update(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract setBlock(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract linkUser(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract list(filters: ListAdoptionCandidateFilters): Promise<PaginatedAdoptionCandidates>;
}
