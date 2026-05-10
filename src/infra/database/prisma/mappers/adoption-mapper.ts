import { Adoption as PrismaAdoption } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import {
  Adoption,
  AdoptionStatus,
} from '@/domain/adoption/enterprise/entities/adoption';

export class MapperPrismaAdoption {
  static toDomain(raw: PrismaAdoption): Adoption {
    return Adoption.create(
      {
        petId: new UniqueEntityId(raw.petId),
        adopterId: new UniqueEntityId(raw.adopterId),
        unityId: new UniqueEntityId(raw.unitId),
        status: raw.status as AdoptionStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(adoption: Adoption) {
    return {
      id: adoption.id.toString(),
      petId: adoption.petId.toString(),
      adopterId: adoption.adopterId.toString(),
      unitId: adoption.unityId.toString(),
      status: adoption.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    };
  }
}
