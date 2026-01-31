import { UniqueEntityId } from "../entities/unique-entity-id"

export interface  InterfaceDomainEvent {
  ocurredAt: Date
  getAggregateId(): UniqueEntityId //a  entidade que gerou o evento id dela 
}
