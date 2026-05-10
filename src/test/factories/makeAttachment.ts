import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Attachment } from '@/domain/Attachment/enterprise/entities/attachment';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export function makeAttachment(
  override: Partial<{ title: string; link: string }> = {},
  id?: UniqueEntityId,
): Attachment {
  return Attachment.create(
    {
      title: override.title ?? 'foto-teste.jpg',
      link: override.link ?? '/uploads/foto-teste.jpg',
    },
    id,
  );
}

@Injectable()
export class AttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAttachment(
    override: Partial<{ title: string; link: string; petId: string; unitId: string }> = {},
  ): Promise<Attachment> {
    const attachment = makeAttachment(override);

    await this.prisma.attachment.create({
      data: {
        id: attachment.id.toString(),
        title: attachment.title,
        link: attachment.link,
        petId: override.petId ?? null,
        unitId: override.unitId ?? null,
      },
    });

    return attachment;
  }
}
