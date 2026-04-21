import { Injectable } from '@nestjs/common';
import { Units } from '../../enterprise/entities/unity';
import { RepositoriesUnits, ListUnitsFilters, PaginatedUnits } from '../repositories/unistsRepositories';

@Injectable()
export class ServiceListUnits {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute(filters: ListUnitsFilters): Promise<PaginatedUnits> {
    return this.repositoriesUnits.list(filters);
  }
}
