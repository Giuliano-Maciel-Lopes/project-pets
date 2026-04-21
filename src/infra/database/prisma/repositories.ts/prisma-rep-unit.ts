import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  RepositoriesUnits,
  ListUnitsFilters,
  PaginatedUnits,
} from '@/domain/companyUnits/application/repositories/unistsRepositories';
import { Units } from '@/domain/companyUnits/enterprise/entities/unity';
import { MapperPrismaUnit } from '../mappers/unit-mapper';

const includeAttachments = { attachments: true };

@Injectable()
export class PrismaRepositoriesUnit implements RepositoriesUnits {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Units | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { slug },
      include: includeAttachments,
    });
    if (!unit) return null;
    return MapperPrismaUnit.toDomain(unit);
  }

  async findById(id: string): Promise<Units | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: includeAttachments,
    });
    if (!unit) return null;
    return MapperPrismaUnit.toDomain(unit);
  }

  async list({
    name,
    slug,
    city,
    state,
    isActive,
    isPrincipal,
    managerId,
    page,
    limit,
  }: ListUnitsFilters): Promise<PaginatedUnits> {
    const where: Record<string, unknown> = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (slug) where.slug = { contains: slug, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { equals: state, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive;
    if (isPrincipal !== undefined) where.isPrincipal = isPrincipal;
    if (managerId) where.managerId = managerId;

    const skip = (page - 1) * limit;

    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: includeAttachments,
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      units: units.map(MapperPrismaUnit.toDomain),
      total,
      page,
      limit,
    };
  }

  async create(unit: Units): Promise<void> {
    await this.prisma.unit.create({
      data: MapperPrismaUnit.toPrisma(unit),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({ where: { id } });
  }

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    await this.prisma.unit.update({
      where: { id },
      data: { isActive },
    });
  }

  async update(id: string, unit: Units): Promise<void> {
    await this.prisma.unit.update({
      where: { id },
      data: {
        name: unit.name,
        address: unit.address,
        city: unit.city,
        state: unit.state,
        slug: unit.slug.value,
        managerId: unit.managerId.toString(),
      },
    });
  }
}
