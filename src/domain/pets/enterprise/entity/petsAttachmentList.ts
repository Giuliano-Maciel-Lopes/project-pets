import { WatchedList } from '@/core/entities/watched-list';
import { PetAttachment } from './petsAttachment';

export class PetAttachmentlist extends WatchedList<PetAttachment> {
  compareItems(a: PetAttachment, b: PetAttachment): boolean {
    return a.attachmentId.equals(b.attachmentId);
  }
}
