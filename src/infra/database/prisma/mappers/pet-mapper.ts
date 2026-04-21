import { Pet as PrismaPet, Attachment as PrismaAttachment } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Pets, PetStatus, PetSex } from '@/domain/pets/enterprise/entity/pets';
import { PetAttachment } from '@/domain/pets/enterprise/entity/petsAttachment';
import { PetAttachmentlist } from '@/domain/pets/enterprise/entity/petsAttachmentList';

type PrismaPetWithAttachments = PrismaPet & {
  attachments?: PrismaAttachment[];
};

export class MapperPrismaPet {
  static toDomain(pet: PrismaPetWithAttachments): Pets {
    const attachmentList = new PetAttachmentlist(
      (pet.attachments ?? []).map((attachment) =>
        PetAttachment.create({
          petId: new UniqueEntityId(pet.id),
          attachmentId: new UniqueEntityId(attachment.id),
          title: attachment.title,
          link: attachment.link,
        }),
      ),
    );

    return Pets.create(
      {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age ?? undefined,
        sex: pet.sex ? (pet.sex.toLowerCase() as PetSex) : null,
        status: pet.status.toLowerCase() as PetStatus,
        isActive: pet.isActive,
        unitId: new UniqueEntityId(pet.unitId),
        attachment: attachmentList,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt,
      },
      new UniqueEntityId(pet.id),
    );
  }

  static toPrisma(pet: Pets) {
    return {
      id: pet.id.toString(),
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age ?? null,
      sex: pet.gender ? (pet.gender.toUpperCase() as 'MALE' | 'FEMALE') : null,
      status: pet.status.toUpperCase() as 'AVAILABLE' | 'UNAVAILABLE' | 'ANALYSIS',
      isActive: pet.isActive,
      unitId: pet.unitId.toString(),
    };
  }
}
