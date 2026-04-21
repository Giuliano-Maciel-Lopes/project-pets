import { Injectable } from '@nestjs/common';
import {
  RepositoriesPets,
  ListPetsFilters,
  PaginatedPets,
} from '../repositories/pets';

@Injectable()
export class ServiceListPets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute(filters: ListPetsFilters): Promise<PaginatedPets> {
    return this.repositoriesPets.list(filters);
  }
}
