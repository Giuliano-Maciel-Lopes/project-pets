import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RepositoriesAdoption } from '@/domain/adoption/application/repositories/adoption';
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

  async list(): Promise<Adoption[]> {
    const raws = await this.prisma.adoption.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(MapperPrismaAdoption.toDomain);
  }
}
