import { Unit as PrismaUnit, Attachment as PrismaAttachment } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Slug } from '@/core/value-objects/slug';
import { Units } from '@/domain/companyUnits/enterprise/entities/unity';

type PrismaUnitWithAttachments = PrismaUnit & {
  attachments?: PrismaAttachment[];
};

export class MapperPrismaUnit {
  static toDomain(unit: PrismaUnitWithAttachments): Units {
    return Units.create(
      {
        name: unit.name,
        address: unit.address,
        city: unit.city,
        state: unit.state,
        slug: Slug.create(unit.slug),
        isPrincipal: unit.isPrincipal,
        isActive: unit.isActive,
        managerId: new UniqueEntityId(unit.managerId),
        attachments: unit.attachments?.map((attachment) => ({
          id: attachment.id,
          title: attachment.title,
          link: attachment.link,
        })),
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      },
      new UniqueEntityId(unit.id),
    );
  }

  static toPrisma(unit: Units) {
    return {
      id: unit.id.toString(),
      name: unit.name,
      address: unit.address,
      city: unit.city,
      state: unit.state,
      slug: unit.slug.value,
      isPrincipal: unit.isPrincipal,
      isActive: unit.isActive,
      managerId: unit.managerId.toString(),
    };
  }
}
