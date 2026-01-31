import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InterfaceDomainEvent } from '@/core/events/domain-event-Interface';
import { Adoption } from '../entities/adoption';

export class SetStatusEvent implements InterfaceDomainEvent {
  ocurredAt: Date;
  adoption: Adoption;

  constructor(adoption: Adoption) {
    this.ocurredAt = new Date();
    this.adoption = adoption;
  }
  getAggregateId(): UniqueEntityId {
    return this.adoption.id;
  }
}
