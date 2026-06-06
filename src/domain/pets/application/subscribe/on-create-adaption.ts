import { EventHandler } from '@/core/events/event-handler';
import { ServiceSetStatusPets } from '../services/setStatus-service-pets';
import { PetStatus } from '../../enterprise/entity/pets';
import { CreateAdoptionEvent } from '@/domain/adoption/enterprise/events/create-adoption';
import { DomainEvents } from '@/core/events/domain-events';

export class OncreateAdoption implements EventHandler {
  constructor(private serviceSetStatusPets: ServiceSetStatusPets) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleStatusPet.bind(this),
      CreateAdoptionEvent.name,
    );
  }

  private async handleStatusPet({ adoption }: CreateAdoptionEvent) {
    await this.serviceSetStatusPets.executeAsSystem(
      adoption.petId.toString(),
      PetStatus.ANALYSIS,
    );
  }
}
