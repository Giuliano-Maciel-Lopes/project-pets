import { RepositoriesUnits } from "@/domain/companyUnits/application/repositories/unistsRepositories";
import { Units } from "@/domain/companyUnits/enterprise/entities/unity";

export class InMemoryRepositoriesUnits implements RepositoriesUnits {
  public items: Units[] = [];

  async create(unit: Units) {
    this.items.push(unit);
  }

  async findBySlug(slug: string): Promise<Units | null> {
    const unit = this.items.find((item) => item.slug.value === slug);

    return unit ?? null;
  }

  async findById(id: string): Promise<Units | null> {
    const unit = this.items.find((item) => item.id.toString() === id);

    return unit ?? null;
  }

  async list() {
    return this.items;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }
async toggleActive(id: string, isActiveValue: boolean): Promise<void> {
  const index = this.items.findIndex(item => item.id.toString() === id);
  if (index === -1) {
    throw new Error("Unidade não encontrada");
  }
  this.items[index] = this.items[index]; 
}
  async update(id: string, unit: Units): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index === -1) {
      return;
    }

   
  }
}
