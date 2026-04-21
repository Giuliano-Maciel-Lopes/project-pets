import { Attachment as PrismaAttachment } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Attachment } from '@/domain/Attachment/enterprise/entities/attachment';

export class MapperPrismaAttachment {
  static toDomain(attachment: PrismaAttachment): Attachment {
    return Attachment.create(
      { title: attachment.title, link: attachment.link },
      new UniqueEntityId(attachment.id),
    );
  }

  static toPrisma(attachment: Attachment) {
    return {
      id: attachment.id.toString(),
      title: attachment.title,
      link: attachment.link,
    };
  }
}
