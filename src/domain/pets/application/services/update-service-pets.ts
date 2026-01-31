import { Either, left, right } from '@/core/either';
import { Pets, PetSex } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ServicePetAttachments } from './attachements-service-pets';

interface UpdatePetServiceRequest {
  id: string;
  name: string;
  species: string;
  unitId: string;
  breed: string;
  age?: number;
  sex?: PetSex;
  attachmentIds: string[];
}

type UpdatePetServiceResponse = Either<NotFoundError, { pet: Pets }>;

export class ServiceUpdatePets {
  constructor(
    private repositoriesPets: RepositoriesPets,
    private servicePetAttachments: ServicePetAttachments,
  ) {}

  async execute(
    data: UpdatePetServiceRequest,
  ): Promise<UpdatePetServiceResponse> {
    const pet = await this.repositoriesPets.findById(data.id);

    if (!pet) {
      return left(new NotFoundError('pet'));
    }
    pet.update({
      ...data,
      id: new UniqueEntityId(data.id),
      unitId: new UniqueEntityId(data.unitId),
    });

    await this.servicePetAttachments.update({
      attachmentIds: data.attachmentIds,
      pet,
    });

    await this.repositoriesPets.update(pet);

    return right({ pet });
  }
}
