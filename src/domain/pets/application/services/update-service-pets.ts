import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Pets, PetSex } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ServicePetAttachments } from './attachements-service-pets';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';

interface UpdatePetServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  name: string;
  species: string;
  unitId: string;
  breed: string;
  age?: number;
  sex?: PetSex;
  attachmentIds: string[];
}

type UpdatePetServiceResponse = Either<NotFoundError | UnauthorizedError, { pet: Pets }>;

type PetContext = { actor: { id: string; role: Role }; pet: Pets | null };

@Injectable()
export class ServiceUpdatePets {
  constructor(
    private repositoriesPets: RepositoriesPets,
    private servicePetAttachments: ServicePetAttachments,
  ) {}

  async execute({
    actor,
    ...data
  }: UpdatePetServiceRequest): Promise<UpdatePetServiceResponse> {
    const pet = await this.repositoriesPets.findById(data.id);

    const policyResult = await PolicyRunner.run<PetContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('pet', (ctx) => ctx.pet),
      ],
      { actor, pet },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    pet!.update({
      ...data,
      id: new UniqueEntityId(data.id),
      unitId: new UniqueEntityId(data.unitId),
    });

    await this.servicePetAttachments.update({
      attachmentIds: data.attachmentIds,
      pet: pet!,
    });

    await this.repositoriesPets.update(pet!);

    return right({ pet: pet! });
  }
}
