import { AdoptionCandidate } from '../../enterprise/entities/adoptionCandidate';

export interface RepositoriesAdoptionCandidate {
  findById(id: string): Promise<AdoptionCandidate | null>;
  create(adoptionCan: AdoptionCandidate): Promise<void>;
  update(adoptionCan: AdoptionCandidate): Promise<void>;
  setBlock(adoptionCan: AdoptionCandidate): Promise<void>;
}
