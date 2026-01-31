import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { UpdatePetProps } from './types';
import { AggregateRoot } from '@/core/entities/aggregate-root';
import { PetAttachmentlist } from './petsAttachmentList';

export enum PetStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  ANALYSIS = 'analysis',
}

export enum PetSex {
  MALE = 'male',
  FEMALE = 'female',
}

export interface PetProps {
  name: string;
  species: string;
  isActive: boolean; // default true
  status: PetStatus; // default = AVAILABLE
  breed: string;
  age?: number;
  sex?: PetSex | null;

  unitId: UniqueEntityId;
  attachment: PetAttachmentlist;

  createdAt: Date;
  updatedAt?: Date;
}

export class Pets extends AggregateRoot<PetProps> {
  static create(
    props: Optional<
      PetProps,
      'createdAt' | 'status' | 'isActive' | 'attachment'
    >,
    id?: UniqueEntityId,
  ) {
    const petsContent = new Pets(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? PetStatus.AVAILABLE,
        isActive: props.isActive ?? true,
        attachment: props.attachment ?? new PetAttachmentlist(),
      },
      id,
    );
    return petsContent;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
  setActive(isActiveValue: boolean) {
    this.props.isActive = isActiveValue;
    this.touch();
  }
  setStatus(status: PetStatus) {
    this.props.status = status;
    this.touch();
  }

  update(props: UpdatePetProps) {
    this.props.name = props.name;
    this.props.species = props.species;
    this.props.unitId = props.unitId;
    this.props.breed = props.breed;

    if (props.age !== undefined) {
      this.props.age = props.age;
    }

    if (props.sex !== undefined) {
      this.props.sex = props.sex;
    }

    this.touch();
  }

  setattachment(attachment: PetAttachmentlist) {
    this.props.attachment = attachment;
  }

  // geters

  get name() {
    return this.props.name;
  }

  get species() {
    return this.props.species;
  }

  get breed() {
    return this.props.breed;
  }

  get age() {
    return this.props.age;
  }

  get gender() {
    return this.props.sex;
  }

  get status() {
    return this.props.status;
  }

  get isActive() {
    return this.props.isActive;
  }

  get unitId() {
    return this.props.unitId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
  get attachment() {
    return this.props.attachment;
  }
}
