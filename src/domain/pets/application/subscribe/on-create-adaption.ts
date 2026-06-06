import { EventHandler } from '@/core/events/event-handler';
import { ServiceSetStatusPets } from '../services/setStatus-service-pets';
import { PetStatus } from '../../enterprise/entity/pets';
import { CreateAdoptionEvent } from '@/domain/adoption/enterprise/events/create-adoption';
import { DomainEvents } from '@/core/events/domain-events';
import { SYSTEM_ACTOR } from '@/core/system-actor';

export class OnCreateAdoption implements EventHandler {
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
    await this.serviceSetStatusPets.execute({
      actor: SYSTEM_ACTOR,
      id: adoption.petId.toString(),
      status: PetStatus.ANALYSIS,
    });
  }
}
