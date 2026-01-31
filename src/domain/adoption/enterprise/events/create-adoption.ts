import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InterfaceDomainEvent } from '@/core/events/domain-event-Interface';
import { Adoption } from '../entities/adoption';

export class CreateAdoptionEvent implements InterfaceDomainEvent {
  public adoption: Adoption;
  public ocurredAt: Date;

  constructor(adoption: Adoption) {
    this.adoption = adoption;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.adoption.id;
  }
}
