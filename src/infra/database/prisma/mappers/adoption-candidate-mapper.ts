import { AdoptionCandidate as PrismaAdoptionCandidate } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';

export class MapperPrismaAdoptionCandidate {
  static toDomain(raw: PrismaAdoptionCandidate): AdoptionCandidate {
    return AdoptionCandidate.create(
      {
        name: raw.name,
        cpf: CPF.create(raw.cpf),
        phone: raw.phone,
        identityUrl: raw.identityUrl,
        isBanned: raw.isBanned,
        bannedReason: raw.bannedReason ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(candidate: AdoptionCandidate) {
    return {
      id: candidate.id.toString(),
      name: candidate.name,
      cpf: candidate.cpf.value,
      phone: candidate.phone,
      identityUrl: candidate.identityUrl,
      isBanned: candidate.isBanned,
      bannedReason: candidate.bannedReason ?? null,
    };
  }
}
