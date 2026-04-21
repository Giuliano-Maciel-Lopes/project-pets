import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { Pets, PetSex, PetStatus } from '../../enterprise/entity/pets';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { RepositoriesPets } from '../repositories/pets';
import { ServicePetAttachments } from './attachements-service-pets';

interface CreatePetServiceRequest {
  name: string;
  species: string;
  unitId: string;
  status?: PetStatus;
  breed: string;
  age?: number;
  sex?: PetSex;
  attachmentIds: string[];
}

type CreatePetServiceResponse = Either<null, { pet: Pets }>;

@Injectable()
export class ServiceCreatePets {
  constructor(
    private repositoriesPets: RepositoriesPets,
    private servicePetAttachments: ServicePetAttachments,
  ) {}

  async execute(
    data: CreatePetServiceRequest,
  ): Promise<CreatePetServiceResponse> {
    const pet = Pets.create({
      ...data,
      unitId: new UniqueEntityId(data.unitId),
    });

    await this.servicePetAttachments.create({
      attachmentIds: data.attachmentIds,
      pet,
    });

    await this.repositoriesPets.create(pet);

    return right({ pet });
  }
}
