import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  RepositoriesAdoptionCandidate,
  ListAdoptionCandidateFilters,
  PaginatedAdoptionCandidates,
} from '@/domain/adoption/application/repositories/adoptioncandidate';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { MapperPrismaAdoptionCandidate } from '../mappers/adoption-candidate-mapper';

@Injectable()
export class PrismaRepositoriesAdoptionCandidate
  implements RepositoriesAdoptionCandidate
{
  constructor(private prisma: PrismaService) {}

  async findBy({
    id,
    email,
    cpf,
    userId,
  }: {
    id?: string;
    email?: string;
    cpf?: string;
    userId?: string;
  }): Promise<AdoptionCandidate | null> {
    const raw = await this.prisma.adoptionCandidate.findFirst({
      where: {
        OR: [
          id ? { id } : undefined,
          email ? { email } : undefined,
          cpf ? { cpf: cpf.replace(/\D/g, '') } : undefined,
          userId ? { userId } : undefined,
        ].filter(Boolean) as object[],
      },
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

  async linkUser(candidate: AdoptionCandidate): Promise<void> {
    await this.prisma.adoptionCandidate.update({
      where: { id: candidate.id.toString() },
      data: { userId: candidate.userId?.toString() ?? null },
    });
  }

  async list({
    userId,
    name,
    cpf,
    isBanned,
    page,
    limit,
  }: ListAdoptionCandidateFilters): Promise<PaginatedAdoptionCandidates> {
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (cpf) where.cpf = { contains: cpf.replace(/\D/g, '') };
    if (isBanned !== undefined) where.isBanned = isBanned;

    const skip = (page - 1) * limit;

    const [raws, total] = await Promise.all([
      this.prisma.adoptionCandidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adoptionCandidate.count({ where }),
    ]);

    return {
      candidates: raws.map(MapperPrismaAdoptionCandidate.toDomain),
      total,
      page,
      limit,
    };
  }
}
