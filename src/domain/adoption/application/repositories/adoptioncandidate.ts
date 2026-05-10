import { AdoptionCandidate } from '../../enterprise/entities/adoptionCandidate';

export interface ListAdoptionCandidateFilters {
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
  abstract findById(id: string): Promise<AdoptionCandidate | null>;
  abstract create(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract update(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract setBlock(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract list(filters: ListAdoptionCandidateFilters): Promise<PaginatedAdoptionCandidates>;
}
