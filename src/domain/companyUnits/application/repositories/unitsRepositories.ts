import { Units } from '../../enterprise/entities/unity';

export interface ListUnitsFilters {
  name?: string;
  slug?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  isPrincipal?: boolean;
  managerId?: string;
  page: number;
  limit: number;
}

export interface PaginatedUnits {
  units: Units[];
  total: number;
  page: number;
  limit: number;
}

export abstract class RepositoriesUnits {
  abstract findBySlug(slug: string): Promise<Units | null>;
  abstract findById(id: string): Promise<Units | null>;
  abstract list(filters: ListUnitsFilters): Promise<PaginatedUnits>;
  abstract create(unit: Units): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract toggleActive(id: string, isActive: boolean): Promise<void>;
  abstract update(id: string, unit: Units): Promise<void>;
}
