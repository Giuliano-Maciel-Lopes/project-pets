import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  RepositoriesAdoption,
  ListAdoptionFilters,
  PaginatedAdoptions,
} from '@/domain/adoption/application/repositories/adoption';
import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';
import { MapperPrismaAdoption } from '../mappers/adoption-mapper';

@Injectable()
export class PrismaRepositoriesAdoption implements RepositoriesAdoption {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Adoption | null> {
    const raw = await this.prisma.adoption.findUnique({ where: { id } });
    if (!raw) return null;
    return MapperPrismaAdoption.toDomain(raw);
  }

  async create(adoption: Adoption): Promise<void> {
    await this.prisma.adoption.create({
      data: MapperPrismaAdoption.toPrisma(adoption),
    });
  }

  async update(adoption: Adoption): Promise<void> {
    await this.prisma.adoption.update({
      where: { id: adoption.id.toString() },
      data: {
        status: adoption.status as 'PENDING' | 'APPROVED' | 'REJECTED',
      },
    });
  }

  async list({
    status,
    adopterId,
    petId,
    unityId,
    page,
    limit,
  }: ListAdoptionFilters): Promise<PaginatedAdoptions> {
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (adopterId) where.adopterId = adopterId;
    if (petId) where.petId = petId;
    if (unityId) where.unitId = unityId;

    const skip = (page - 1) * limit;

    const [raws, total] = await Promise.all([
      this.prisma.adoption.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adoption.count({ where }),
    ]);

    return {
      adoptions: raws.map(MapperPrismaAdoption.toDomain),
      total,
      page,
      limit,
    };
  }
}
