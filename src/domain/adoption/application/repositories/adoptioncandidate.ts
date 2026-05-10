import { AdoptionCandidate } from '../../enterprise/entities/adoptionCandidate';

export abstract class RepositoriesAdoptionCandidate {
  abstract findById(id: string): Promise<AdoptionCandidate | null>;
  abstract create(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract update(adoptionCan: AdoptionCandidate): Promise<void>;
  abstract setBlock(adoptionCan: AdoptionCandidate): Promise<void>;
}
