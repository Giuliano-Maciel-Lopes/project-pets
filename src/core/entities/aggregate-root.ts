import { DomainEvents } from '../events/domain-events';
import { Entity } from './entitty';
import { InterfaceDomainEvent } from '../events/domain-event-Interface';

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: InterfaceDomainEvent[] = [];

  get domainEvents(): InterfaceDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: InterfaceDomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents() {
    this._domainEvents = [];
  }
}
