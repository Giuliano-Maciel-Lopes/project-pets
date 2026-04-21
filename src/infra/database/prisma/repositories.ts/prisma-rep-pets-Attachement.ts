import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RepositoryPetAttachments } from '@/domain/pets/application/repositories/petsAttachement';
import { PetAttachment } from '@/domain/pets/enterprise/entity/petsAttachment';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

@Injectable()
export class PrismaRepositoryPetAttachments implements RepositoryPetAttachments {
  constructor(private prisma: PrismaService) {}

  async findManyByPetId(petId: string): Promise<PetAttachment[]> {
    const attachments = await this.prisma.attachment.findMany({
      where: { petId },
    });

    return attachments.map((attachment) =>
      PetAttachment.create({
        petId: new UniqueEntityId(attachment.petId!),
        attachmentId: new UniqueEntityId(attachment.id),
        title: attachment.title,
        link: attachment.link,
      }),
    );
  }

  async deleteManyByPetId(petId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({ where: { petId } });
  }
}
