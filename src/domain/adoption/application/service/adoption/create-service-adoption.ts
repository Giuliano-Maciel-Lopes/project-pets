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
import { RepositoriesUnits } from '@/domain/companyUnits/application/repositories/unistsRepositories';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import {
  UnitAndPetDistincsPolicy,
  CandidateMustNotBeBannedPolicy,
  PetUnavailblePolicy,
} from '@/domain/adoption/police';
import { PolicyRunner } from '@/core/police/policeRun';
import { EntityMustExistPolicy } from '@/core/police/EntityMustExistPolicy';
import { PolicyContextEntity } from '@/core/police/AdoptionPolicyContext';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedEmailError } from '@/domain/adoption/errro/unauthorizedEmailError';

interface RequestingUser {
  email: string;
  role: Role;
}

interface CreateAdoptionServiceRequest {
  petId: string;
  adopterId: string;
  unityId: string;
  status: AdoptionStatus;
  requestingUser: RequestingUser;
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
    adopterId,
    petId,
    status,
    unityId,
    requestingUser,
  }: CreateAdoptionServiceRequest): Promise<CreateAdoptionServiceResponse> {
    const [candidate, pet, unit] = await Promise.all([
      this.repositoriesAdoptionCandidate.findBy({ id: adopterId }),
      this.repositoriesPets.findById(petId),
      this.repositoriesUnits.findById(unityId),
    ]);

    if (
      requestingUser.role !== Role.ADMIN &&
      candidate?.email !== requestingUser.email
    ) {
      return left(new UnauthorizedEmailError());
    }

    const allPolicies = [
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
