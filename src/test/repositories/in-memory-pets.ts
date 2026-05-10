import {
  RepositoriesPets,
  ListPetsFilters,
  PaginatedPets,
} from '@/domain/pets/application/repositories/pets';
import { Pets } from '@/domain/pets/enterprise/entity/pets';
import { InMemoryRepositoriesPetsAttachements } from './in-memory-pets-Attachement';

export class InMemoryRepositoriesPets implements RepositoriesPets {
  constructor(
    private inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements = new InMemoryRepositoriesPetsAttachements(),
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
      (p) => p.id.toString() === petToUpdate.id.toString(),
    );

    if (index >= 0) {
      this.items[index] = petToUpdate;
    }
  }
  async list({ name, species, breed, status, sex, isActive, unitId, page, limit }: ListPetsFilters): Promise<PaginatedPets> {
    let filtered = this.items;

    if (name) filtered = filtered.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()));
    if (species) filtered = filtered.filter((p) => p.species.toLowerCase().includes(species.toLowerCase()));
    if (breed) filtered = filtered.filter((p) => p.breed.toLowerCase().includes(breed.toLowerCase()));
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (sex) filtered = filtered.filter((p) => p.gender === sex);
    if (isActive !== undefined) filtered = filtered.filter((p) => p.isActive === isActive);
    if (unitId) filtered = filtered.filter((p) => p.unitId.toString() === unitId);

    const total = filtered.length;
    const pets = filtered.slice((page - 1) * limit, page * limit);

    return { pets, total, page, limit };
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);

      await this.inMemoryRepositoriesPetsAttachements.deleteManyByPetId(id);
    }
  }
}
