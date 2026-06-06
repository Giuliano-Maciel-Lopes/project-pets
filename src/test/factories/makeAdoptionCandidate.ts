import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AdoptionCandidate,
  AdoptionCandidateProps,
} from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaAdoptionCandidate } from '@/infra/database/prisma/mappers/adoption-candidate-mapper';

function randomCpf(): string {
  const n = String(Math.floor(10000000000 + Math.random() * 89999999999));
  return n;
}

export function makeAdoptionCandidate(
  override: Partial<AdoptionCandidateProps> = {},
  id?: UniqueEntityId,
): AdoptionCandidate {
  const canndidate = AdoptionCandidate.create(
    {
      email: `candidate-${randomUUID()}@test.com`,
      name: 'GiulianoLindo',
      cpf: CPF.fromRaw(randomCpf()),
      phone: `119${Math.floor(10000000 + Math.random() * 89999999)}`,
      identityUrl: 'http://url-da-identidade.com/foto.jpg',
      isBanned: false,
      ...override,
    },
    id,
  );
  return canndidate;
}

@Injectable()
export class AdoptionCandidateFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAdoptionCandidate(
    override: Partial<AdoptionCandidateProps> = {},
    id?: UniqueEntityId,
  ): Promise<AdoptionCandidate> {
    const candidate = makeAdoptionCandidate(override, id);

    await this.prisma.adoptionCandidate.create({
      data: MapperPrismaAdoptionCandidate.toPrisma(candidate),
    });

    return candidate;
  }
}
