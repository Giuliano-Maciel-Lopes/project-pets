import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import {
  Adoption,
  AdoptionStatus,
} from '@/domain/adoption/enterprise/entities/adoption';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoption } from '../../repositories/adoption';
import { PetStatus } from '@/domain/pets/enterprise/entity/pets';
import { RepositoriesPets } from '@/domain/pets/application/repositories/pets';
import { RepositoriesUnits } from '@/domain/companyUnits/application/repositories/unitsRepositories';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import {
  UnitAndPetDistincsPolicy,
  CandidateMustNotBeBannedPolicy,
  PetUnavailblePolicy,
} from '@/domain/adoption/police';
import { Policy } from '@/core/police/policy';
import { PolicyRunner } from '@/core/police/policeRun';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { PolicyContextEntity } from '@/domain/adoption/police/AdoptionPolicyContext';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { SelfOrAdminPolicy } from '@/core/police/self-or-admin-policy';

interface CreateAdoptionServiceRequest {
  actor: { id: string; role: Role };
  petId: string;
  adopterId: string;
  unityId: string;
  status: AdoptionStatus;
}

type CreateAdoptionServiceResponse = Either<Error, { adoption: Adoption }>;

@Injectable()
export class ServiceCreateAdoption {
  constructor(
    private repositoriesAdoption: RepositoriesAdoption,
    private repositoriesPets: RepositoriesPets,
    private repositoriesUnits: RepositoriesUnits,
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    adopterId,
    petId,
    status,
    unityId,
  }: CreateAdoptionServiceRequest): Promise<CreateAdoptionServiceResponse> {
    const authResult = await PolicyRunner.run(
      [new SelfOrAdminPolicy()],
      { actor, resourceOwnerId: adopterId },
    );
    if (authResult.isLeft()) return left(authResult.value);

    const [candidate, pet, unit] = await Promise.all([
      this.repositoriesAdoptionCandidate.findBy({ id: adopterId }),
      this.repositoriesPets.findById(petId),
      this.repositoriesUnits.findById(unityId),
    ]);

    const allPolicies: Policy<PolicyContextEntity, Error>[] = [
      new EntityMustExistPolicy('Candidate', (ctx) => ctx.candidate),
      new EntityMustExistPolicy('Pet', (ctx) => ctx.pet),
      new EntityMustExistPolicy('Unit', (ctx) => ctx.unit),
      new CandidateMustNotBeBannedPolicy(),
      new PetUnavailblePolicy(),
      new UnitAndPetDistincsPolicy(),
    ];
    const context: PolicyContextEntity = { candidate, pet, unit };

    const policyResult = await PolicyRunner.run(allPolicies, context);
    if (policyResult.isLeft()) {
      return left(policyResult.value);
    }

    const adoption = Adoption.create({
      adopterId: new UniqueEntityId(adopterId),
      petId: new UniqueEntityId(petId),
      status,
      unityId: new UniqueEntityId(unityId),
    });

    await this.repositoriesAdoption.create(adoption);
    pet!.setStatus(PetStatus.ANALYSIS);
    await this.repositoriesPets.update(pet!);

    return right({ adoption });
  }
}
