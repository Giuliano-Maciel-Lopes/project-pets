import { Injectable } from '@nestjs/common';
import {
  RepositoriesAdoption,
  ListAdoptionFilters,
  PaginatedAdoptions,
} from '../../repositories/adoption';

@Injectable()
export class ServiceListAdoption {
  constructor(private repositoriesAdoptions: RepositoriesAdoption) {}

  async execute(filters: ListAdoptionFilters): Promise<PaginatedAdoptions> {
    return this.repositoriesAdoptions.list(filters);
  }
}
