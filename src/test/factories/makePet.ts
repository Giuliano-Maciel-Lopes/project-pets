import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { PetProps, Pets, PetSex } from '@/domain/pets/enterprise/entity/pets';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaPet } from '@/infra/database/prisma/mappers/pet-mapper';

export function makePet(override: Partial<PetProps> = {}, id?: UniqueEntityId) {
  return Pets.create(
    {
      name: 'Boby',
      species: 'Dog',
      breed: 'Vira-lata',
      age: 2,
      sex: PetSex.MALE,
      unitId: new UniqueEntityId(),
      ...override,
    },
    id,
  );
}

@Injectable()
export class PetFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaPet(override: Partial<PetProps> = {}): Promise<Pets> {
    const pet = makePet(override);

    await this.prisma.pet.create({
      data: MapperPrismaPet.toPrisma(pet),
    });

    return pet;
  }
}
