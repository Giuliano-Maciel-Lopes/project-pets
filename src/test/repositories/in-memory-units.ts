import {
  RepositoriesUnits,
  ListUnitsFilters,
  PaginatedUnits,
} from '@/domain/companyUnits/application/repositories/unistsRepositories';
import { Units } from '@/domain/companyUnits/enterprise/entities/unity';

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

  async list({ name, slug, city, state, isActive, isPrincipal, managerId, page, limit }: ListUnitsFilters): Promise<PaginatedUnits> {
    let filtered = this.items;

    if (name) filtered = filtered.filter((u) => u.name.toLowerCase().includes(name.toLowerCase()));
    if (slug) filtered = filtered.filter((u) => u.slug.value.includes(slug));
    if (city) filtered = filtered.filter((u) => u.city.toLowerCase().includes(city.toLowerCase()));
    if (state) filtered = filtered.filter((u) => u.state === state);
    if (isActive !== undefined) filtered = filtered.filter((u) => u.isActive === isActive);
    if (isPrincipal !== undefined) filtered = filtered.filter((u) => u.isPrincipal === isPrincipal);
    if (managerId) filtered = filtered.filter((u) => u.managerId.toString() === managerId);

    const total = filtered.length;
    const units = filtered.slice((page - 1) * limit, page * limit);

    return { units, total, page, limit };
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }
  async toggleActive(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    if (index === -1) {
      return;
    }
  }
  async update(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index === -1) {
      return;
    }
  }
}
