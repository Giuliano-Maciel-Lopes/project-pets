import { Entity } from '@/core/entities/entitty';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export interface PetAttachmentProps {
  petId: UniqueEntityId;
  attachmentId: UniqueEntityId;
  title?: string;
  link?: string;
}

export class PetAttachment extends Entity<PetAttachmentProps> {
  get petId() {
    return this.props.petId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }

  get title() {
    return this.props.title;
  }

  get link() {
    return this.props.link;
  }

  static create(props: PetAttachmentProps, id?: UniqueEntityId) {
    const answerAttachment = new PetAttachment(props, id);

    return answerAttachment;
  }
}
