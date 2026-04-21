import { Attachment } from '../../enterprise/entities/attachment';

export abstract class AttachmentRepository {
  abstract create(attachment: Attachment): Promise<void>;
  abstract findById(id: string): Promise<Attachment | null>;
}
