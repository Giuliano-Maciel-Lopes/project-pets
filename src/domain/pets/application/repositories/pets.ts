import { Pets } from '../../enterprise/entity/pets';
import { PetStatus, PetSex } from '../../enterprise/entity/pets';

export interface ListPetsFilters {
  name?: string;
  species?: string;
  breed?: string;
  status?: PetStatus;
  sex?: PetSex;
  isActive?: boolean;
  unitId?: string;
  page: number;
  limit: number;
}

export interface PaginatedPets {
  pets: Pets[];
  total: number;
  page: number;
  limit: number;
}

export abstract class RepositoriesPets {
  abstract findById(id: string): Promise<Pets | null>;
  abstract create(pet: Pets): Promise<void>;
  abstract update(pet: Pets): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract list(filters: ListPetsFilters): Promise<PaginatedPets>;
}
