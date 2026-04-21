import { PetAttachment } from '../../enterprise/entity/petsAttachment';

export abstract class RepositoryPetAttachments {
  abstract findManyByPetId(petId: string): Promise<PetAttachment[]>;
  abstract deleteManyByPetId(petId: string): Promise<void>;
}
