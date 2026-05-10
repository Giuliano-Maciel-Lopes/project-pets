import { Adoption, AdoptionStatus } from '../../enterprise/entities/adoption';

export interface ListAdoptionFilters {
  status?: AdoptionStatus;
  adopterId?: string;
  petId?: string;
  unityId?: string;
  page: number;
  limit: number;
}

export interface PaginatedAdoptions {
  adoptions: Adoption[];
  total: number;
  page: number;
  limit: number;
}

export abstract class RepositoriesAdoption {
  abstract findById(id: string): Promise<Adoption | null>;
  abstract create(adoption: Adoption): Promise<void>;
  abstract update(adoption: Adoption): Promise<void>;
  abstract list(filters: ListAdoptionFilters): Promise<PaginatedAdoptions>;
}
