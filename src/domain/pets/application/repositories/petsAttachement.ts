import { PetAttachment } from "../../enterprise/entity/petsAttachment"

export interface RepositoryPetAttachments {
  findManyByPetId(petId: string): Promise<PetAttachment[]>
  deleteManyByPetId(petId: string): Promise<void>
}
