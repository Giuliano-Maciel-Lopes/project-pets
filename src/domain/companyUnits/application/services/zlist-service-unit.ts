import { Units } from '../../enterprise/entities/unity';
import { RepositoriesUnits } from '../repositories/unistsRepositories';

//interface ListUnitServiceRequest {}

interface ListUnitServiceResponse {
  units: Units[];
}

export class ServiceFindUnitById {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute(): Promise<ListUnitServiceResponse> {
    const units = await this.repositoriesUnits.list();

    return { units };
  }
}
