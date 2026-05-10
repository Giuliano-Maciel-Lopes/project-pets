import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Units, UnitProps } from '@/domain/companyUnits/enterprise/entities/unity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaUnit } from '@/infra/database/prisma/mappers/unit-mapper';

export function makeUnit(
  override: Partial<UnitProps> = {},
  id?: UniqueEntityId,
) {
  return Units.create(
    {
      name: `Unidade Teste ${randomUUID()}`,
      address: 'Rua Fake, 123',
      city: 'São Paulo',
      state: 'SP',
      managerId: new UniqueEntityId(),
      ...override,
    },
    id,
  );
}

@Injectable()
export class UnitFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUnit(override: Partial<UnitProps> = {}): Promise<Units> {
    const unit = makeUnit(override);

    await this.prisma.unit.create({
      data: MapperPrismaUnit.toPrisma(unit),
    });

    return unit;
  }
}
