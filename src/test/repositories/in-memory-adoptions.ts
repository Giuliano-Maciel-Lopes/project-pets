import { DomainEvents } from "@/core/events/domain-events";
import { RepositoriesAdoption  } from "@/domain/adoption/application/repositories/adoption";
import { Adoption  } from "@/domain/adoption/enterprise/entities/adoption";

export class InMemoryRepositoriesAdoption implements RepositoriesAdoption {

  public items: Adoption[] = [];

  async findById(id: string): Promise<Adoption | null> {
    const adoption = this.items.find((adoption) => adoption.id.toString() === id);

    return adoption ?? null;
  }

  async create(adoption: Adoption): Promise<void> {
    this.items.push(adoption);
    
    DomainEvents.dispatchEventsForAggregate(adoption.id)
  }

  async update(adoptionToUpdate: Adoption) {
    const index = this.items.findIndex(
      (p) => p.id.toString() === adoptionToUpdate.id.toString()
    );

    if (index >= 0) {
      this.items[index] = adoptionToUpdate;
    }
     DomainEvents.dispatchEventsForAggregate(adoptionToUpdate.id)
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);

    if (index >= 0) {
      this.items.splice(index, 1);

    }
  }
    async list() {
    return this.items;
  }
}
