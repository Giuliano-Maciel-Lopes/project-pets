import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AttachmentRepository } from '@/domain/Attachment/application/repositories/attachment-repository';
import { Attachment } from '@/domain/Attachment/enterprise/entities/attachment';
import { MapperPrismaAttachment } from '../mappers/attachment-mapper';

@Injectable()
export class PrismaAttachmentRepository implements AttachmentRepository {
  constructor(private prisma: PrismaService) {}

  async create(attachment: Attachment): Promise<void> {
    await this.prisma.attachment.create({
      data: MapperPrismaAttachment.toPrisma(attachment),
    });
  }

  async findById(id: string): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) return null;
    return MapperPrismaAttachment.toDomain(attachment);
  }
}
