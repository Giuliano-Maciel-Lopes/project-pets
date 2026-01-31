import { Adoption, AdoptionStatus } from "../../enterprise/entities/adoption";

export interface RepositoriesAdoption {
  findById(id: string): Promise<Adoption | null>;
  create(adoption: Adoption): Promise<void>;
  update(adoption: Adoption): Promise<void>;
  list():Promise<Adoption[]>
}
