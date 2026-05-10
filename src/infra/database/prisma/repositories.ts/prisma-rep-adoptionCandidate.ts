import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RepositoriesAdoptionCandidate } from '@/domain/adoption/application/repositories/adoptioncandidate';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { MapperPrismaAdoptionCandidate } from '../mappers/adoption-candidate-mapper';

@Injectable()
export class PrismaRepositoriesAdoptionCandidate
  implements RepositoriesAdoptionCandidate
{
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<AdoptionCandidate | null> {
    const raw = await this.prisma.adoptionCandidate.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return MapperPrismaAdoptionCandidate.toDomain(raw);
  }

  async create(candidate: AdoptionCandidate): Promise<void> {
    await this.prisma.adoptionCandidate.create({
      data: MapperPrismaAdoptionCandidate.toPrisma(candidate),
    });
  }

  async update(candidate: AdoptionCandidate): Promise<void> {
    await this.prisma.adoptionCandidate.update({
      where: { id: candidate.id.toString() },
      data: {
        name: candidate.name,
        phone: candidate.phone,
        identityUrl: candidate.identityUrl,
      },
    });
  }

  async setBlock(candidate: AdoptionCandidate): Promise<void> {
    await this.prisma.adoptionCandidate.update({
      where: { id: candidate.id.toString() },
      data: {
        isBanned: candidate.isBanned,
        bannedReason: candidate.bannedReason ?? null,
      },
    });
  }
}
