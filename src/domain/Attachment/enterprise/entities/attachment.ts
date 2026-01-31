import { Entity } from '@/core/entities/entitty';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

interface AttachmentProps {
  title: string;
  link: string;
}

export class Attachment extends Entity<AttachmentProps> {
  static create(props: AttachmentProps, id?: UniqueEntityId) {
    const attachment = new Attachment(props, id);

    return attachment;
  }

  get title() {
    return this.props.title;
  }

  get link() {
    return this.props.link;
  }
}
