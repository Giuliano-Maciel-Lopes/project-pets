import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Pets, PetStatus } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';

interface SetStatusPetServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  status: PetStatus;
}

type SetStatusPetServiceResponse = Either<NotFoundError | UnauthorizedError, { pet: Pets }>;

type PetContext = { actor: { id: string; role: Role }; pet: Pets | null };

@Injectable()
export class ServiceSetStatusPets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    actor,
    id,
    status,
  }: SetStatusPetServiceRequest): Promise<SetStatusPetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    const policyResult = await PolicyRunner.run<PetContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('pet', (ctx) => ctx.pet),
      ],
      { actor, pet },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    pet!.setStatus(status);
    await this.repositoriesPets.update(pet!);

    return right({ pet: pet! });
  }

  async executeAsSystem(id: string, status: PetStatus): Promise<void> {
    const pet = await this.repositoriesPets.findById(id);
    if (!pet) return;
    pet.setStatus(status);
    await this.repositoriesPets.update(pet);
  }
}
