import { DomainEvents } from '@/core/events/domain-events';
import {
  RepositoriesAdoption,
  ListAdoptionFilters,
  PaginatedAdoptions,
} from '@/domain/adoption/application/repositories/adoption';
import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';

export class InMemoryRepositoriesAdoption implements RepositoriesAdoption {
  public items: Adoption[] = [];

  async findById(id: string): Promise<Adoption | null> {
    const adoption = this.items.find(
      (adoption) => adoption.id.toString() === id,
    );

    return adoption ?? null;
  }

  async create(adoption: Adoption): Promise<void> {
    this.items.push(adoption);

    DomainEvents.dispatchEventsForAggregate(adoption.id);
  }

  async update(adoptionToUpdate: Adoption) {
    const index = this.items.findIndex(
      (p) => p.id.toString() === adoptionToUpdate.id.toString(),
    );

    if (index >= 0) {
      this.items[index] = adoptionToUpdate;
    }
    DomainEvents.dispatchEventsForAggregate(adoptionToUpdate.id);
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async list({
    status,
    adopterId,
    petId,
    unityId,
    page,
    limit,
  }: ListAdoptionFilters): Promise<PaginatedAdoptions> {
    let filtered = this.items;

    if (status) filtered = filtered.filter((a) => a.status === status);
    if (adopterId) filtered = filtered.filter((a) => a.adopterId.toString() === adopterId);
    if (petId) filtered = filtered.filter((a) => a.petId.toString() === petId);
    if (unityId) filtered = filtered.filter((a) => a.unityId.toString() === unityId);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const adoptions = filtered.slice(skip, skip + limit);

    return { adoptions, total, page, limit };
  }
}
