import { RepositoryPetAttachments } from '@/domain/pets/application/repositories/petsAttachement';
import { PetAttachment } from '@/domain/pets/enterprise/entity/petsAttachment';

export class InMemoryRepositoriesPetsAttachements implements RepositoryPetAttachments {
  public items: PetAttachment[] = [];

  async findManyByPetId(petId: string): Promise<PetAttachment[]> {
    return this.items.filter((item) => item.petId?.toString() === petId);
  }

  async deleteManyByPetId(petId: string): Promise<void> {
    this.items = this.items.filter((item) => item.petId?.toString() !== petId);
  }
}
