import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { CreateAdoptionEvent } from '../events/create-adoption';
import { SetStatusEvent } from '../events/setStatus-Adoption';

export enum AdoptionStatus {
  PENDING = 'PENDING', // aqui vai abrir o requerimento para analise de documento
  APPROVED = 'APPROVED', // resposta se ta aprovado  ou nao
  REJECTED = 'REJECTED',
}

export interface AdoptionProps {
  petId: UniqueEntityId;
  adopterId: UniqueEntityId;
  unityId: UniqueEntityId;
  status: AdoptionStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export class Adoption extends AggregateRoot<AdoptionProps> {
  static create(
    props: Optional<AdoptionProps, 'createdAt' | 'status'>,
    id?: UniqueEntityId,
  ) {
    const adoptionContent = new Adoption(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? AdoptionStatus.PENDING,
      },
      id,
    );
    const isNewAdoption = !id;

    if (isNewAdoption) {
      adoptionContent.addDomainEvent(new CreateAdoptionEvent(adoptionContent));
    }

    return adoptionContent;
  }
  private touch() {
    this.props.updatedAt = new Date();
  }

  setStatus(status: AdoptionStatus) {
    this.props.status = status;
    this.touch();

    this.addDomainEvent(new SetStatusEvent(this));
  }
  get petId() {
    return this.props.petId;
  }

  get adopterId() {
    return this.props.adopterId;
  }

  get unityId() {
    return this.props.unityId;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
