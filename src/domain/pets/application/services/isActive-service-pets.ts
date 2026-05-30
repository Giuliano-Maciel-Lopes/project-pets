import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Pets } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Role } from '@/domain/account/enterprise/entities/users';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';

interface IsActivePetServiceRequest {
  actor: { id: string; role: Role };
  id: string;
  isActive: boolean;
}

type IsActivePetServiceResponse = Either<NotFoundError | UnauthorizedError, { pet: Pets }>;

type PetContext = { actor: { id: string; role: Role }; pet: Pets | null };

@Injectable()
export class ServiceIsActivePets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    actor,
    id,
    isActive,
  }: IsActivePetServiceRequest): Promise<IsActivePetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    const policyResult = await PolicyRunner.run<PetContext, UnauthorizedError | NotFoundError>(
      [
        new RequiredRolePolicy([Role.ADMIN]),
        new EntityMustExistPolicy('pet', (ctx) => ctx.pet),
      ],
      { actor, pet },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    pet!.setActive(isActive);
    await this.repositoriesPets.update(pet!);

    return right({ pet: pet! });
  }
}
