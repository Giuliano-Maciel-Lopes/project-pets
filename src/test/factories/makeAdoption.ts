import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import {
  Adoption,
  AdoptionProps,
} from '@/domain/adoption/enterprise/entities/adoption';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaAdoption } from '@/infra/database/prisma/mappers/adoption-mapper';

export function makeAdoption(
  override: Partial<AdoptionProps> = {},
  id?: UniqueEntityId,
): Adoption {
  const adoption = Adoption.create(
    {
      adopterId: new UniqueEntityId(),
      petId: new UniqueEntityId(),
      unityId: new UniqueEntityId(),
      ...override,
    },
    id,
  );
  return adoption;
}

@Injectable()
export class AdoptionFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAdoption(override: Partial<AdoptionProps> = {}): Promise<Adoption> {
    const adoption = makeAdoption(override);

    await this.prisma.adoption.create({
      data: MapperPrismaAdoption.toPrisma(adoption),
    });

    return adoption;
  }
}
