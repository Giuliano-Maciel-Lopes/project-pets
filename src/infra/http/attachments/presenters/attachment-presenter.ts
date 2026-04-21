import { Attachment } from '@/domain/Attachment/enterprise/entities/attachment';

export class AttachmentPresenter {
  static toHTTP(attachment: Attachment) {
    return {
      id: attachment.id.toString(),
      title: attachment.title,
      link: attachment.link,
    };
  }
}
