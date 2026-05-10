import { Injectable } from '@nestjs/common';
import {
  AdoptionCandidate,
  AdoptionCandidateProps,
} from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaAdoptionCandidate } from '@/infra/database/prisma/mappers/adoption-candidate-mapper';

export function makeAdoptionCandidate(
  override: Partial<AdoptionCandidateProps> = {},
  id?: UniqueEntityId,
): AdoptionCandidate {
  const canndidate = AdoptionCandidate.create(
    {
      name: 'GiulianoLindo',
      cpf: CPF.create('123.456.789-09'),
      phone: '11999999999',
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
