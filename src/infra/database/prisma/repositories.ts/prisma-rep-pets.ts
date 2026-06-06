import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  RepositoriesPets,
  ListPetsFilters,
  PaginatedPets,
} from '@/domain/pets/application/repositories/pets';
import { Pets } from '@/domain/pets/enterprise/entity/pets';
import { MapperPrismaPet } from '../mappers/pet-mapper';

const includeAttachments = { attachments: true };

@Injectable()
export class PrismaRepositoriesPets implements RepositoriesPets {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Pets | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: includeAttachments,
    });
    if (!pet) return null;
    return MapperPrismaPet.toDomain(pet);
  }

  async create(pet: Pets): Promise<void> {
    await this.prisma.pet.create({
      data: MapperPrismaPet.toPrisma(pet),
    });
  }

  async update(pet: Pets): Promise<void> {
    await this.prisma.pet.update({
      where: { id: pet.id.toString() },
      data: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age ?? null,
        sex: pet.gender ? (pet.gender.toUpperCase() as 'MALE' | 'FEMALE') : null,
        status: pet.status.toUpperCase() as 'AVAILABLE' | 'UNAVAILABLE' | 'ANALYSIS',
        isActive: pet.isActive,
        unitId: pet.unitId.toString(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pet.delete({ where: { id } });
  }

  async list({
    name,
    species,
    breed,
    status,
    sex,
    isActive,
    unitId,
    page,
    limit,
  }: ListPetsFilters): Promise<PaginatedPets> {
    const where: Record<string, unknown> = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (species) where.species = { contains: species, mode: 'insensitive' };
    if (breed) where.breed = { contains: breed, mode: 'insensitive' };
    if (status) where.status = status.toUpperCase();
    if (sex) where.sex = sex.toUpperCase();
    if (isActive !== undefined) where.isActive = isActive;
    if (unitId) where.unitId = unitId;

    const skip = (page - 1) * limit;

    const [pets, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: includeAttachments,
      }),
      this.prisma.pet.count({ where }),
    ]);

    return {
      pets: pets.map(MapperPrismaPet.toDomain),
      total,
      page,
      limit,
    };
  }
}
