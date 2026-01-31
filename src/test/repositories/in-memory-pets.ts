import { RepositoriesPets } from "@/domain/pets/application/repositories/pets";
import { Pets } from "@/domain/pets/enterprise/entity/pets";
import { InMemoryRepositoriesPetsAttachements } from "./in-memory-pets-Attachement";

export class InMemoryRepositoriesPets implements RepositoriesPets {
  constructor(                                                                        
  private inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements = new InMemoryRepositoriesPetsAttachements()
) {}
// coloquei attachemts como default so pno teste 

  public items: Pets[] = [];

  async findById(id: string): Promise<Pets | null> {
    const pet = this.items.find((pet) => pet.id.toString() === id);

    return pet ?? null;
  }

  async create(pet: Pets): Promise<void> {
    this.items.push(pet);
  }

  async update(petToUpdate: Pets) {
    const index = this.items.findIndex(
      (p) => p.id.toString() === petToUpdate.id.toString()
    );

    if (index >= 0) {
      this.items[index] = petToUpdate;
    }
  }
  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);

    await  this.inMemoryRepositoriesPetsAttachements.deleteManyByPetId(id)
    }
  }
}
