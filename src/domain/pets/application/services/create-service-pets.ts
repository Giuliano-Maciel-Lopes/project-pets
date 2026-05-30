import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Pets, PetSex, PetStatus } from '../../enterprise/entity/pets';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { RepositoriesPets } from '../repositories/pets';
import { ServicePetAttachments } from './attachements-service-pets';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';

interface CreatePetServiceRequest {
  actor: { id: string; role: Role };
  name: string;
  species: string;
  unitId: string;
  status?: PetStatus;
  breed: string;
  age?: number;
  sex?: PetSex;
  attachmentIds: string[];
}

type CreatePetServiceResponse = Either<UnauthorizedError, { pet: Pets }>;

@Injectable()
export class ServiceCreatePets {
  constructor(
    private repositoriesPets: RepositoriesPets,
    private servicePetAttachments: ServicePetAttachments,
  ) {}

  async execute({
    actor,
    ...data
  }: CreatePetServiceRequest): Promise<CreatePetServiceResponse> {
    const policyResult = await PolicyRunner.run(
      [new RequiredRolePolicy([Role.ADMIN])],
      { actor },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

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
