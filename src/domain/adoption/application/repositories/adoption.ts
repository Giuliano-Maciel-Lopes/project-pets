import { Adoption } from '../../enterprise/entities/adoption';

export abstract class RepositoriesAdoption {
  abstract findById(id: string): Promise<Adoption | null>;
  abstract create(adoption: Adoption): Promise<void>;
  abstract update(adoption: Adoption): Promise<void>;
  abstract list(): Promise<Adoption[]>;
}
