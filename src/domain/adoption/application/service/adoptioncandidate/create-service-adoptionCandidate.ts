import { Injectable } from '@nestjs/common';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedEmailError } from '@/domain/adoption/errro/unauthorizedEmailError';

interface RequestingUser {
  id: string;
  email: string;
  role: Role;
}

interface CreateAdoptionCandidateServiceRequest {
  requestingUser: RequestingUser;
  email: string;
  name: string;
  cpf: string;
  phone: string;
  identityUrl: string;
}

type CreateAdoptionCandidateServiceResponse = Either<
  UnauthorizedEmailError,
  { adoptioncandidate: AdoptionCandidate }
>;

@Injectable()
export class ServiceCreateAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    requestingUser,
    email,
    cpf,
    identityUrl,
    name,
    phone,
  }: CreateAdoptionCandidateServiceRequest): Promise<CreateAdoptionCandidateServiceResponse> {
    if (requestingUser.role !== Role.ADMIN && email !== requestingUser.email) {
      return left(new UnauthorizedEmailError());
    }

    const userId =
      requestingUser.role !== Role.ADMIN
        ? new UniqueEntityId(requestingUser.id)
        : undefined;

    const adoptioncandidate = AdoptionCandidate.create({
      userId,
      email,
      cpf: CPF.create(cpf),
      name,
      phone,
      identityUrl,
    });

    await this.repositoriesAdoptionCandidate.create(adoptioncandidate);

    return right({ adoptioncandidate });
  }
}
