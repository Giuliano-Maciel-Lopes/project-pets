import { Injectable } from '@nestjs/common';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';
import { Either, left, right } from '@/core/either';
import { RepositoriesAdoptionCandidate } from '../../repositories/adoptioncandidate';
import { CPF } from '@/domain/adoption/enterprise/entities/value-objects/cpf';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';
import { InvalidCpfError } from '@/domain/adoption/errro/invalidCpfError';

interface CreateAdoptionCandidateServiceRequest {
  actor: { id: string; role: Role };
  email: string;
  name: string;
  cpf: string;
  phone: string;
  identityUrl: string;
}

type CreateAdoptionCandidateServiceResponse = Either<
  InvalidCpfError,
  { adoptioncandidate: AdoptionCandidate }
>;

@Injectable()
export class ServiceCreateAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate,
  ) {}

  async execute({
    actor,
    email,
    cpf,
    identityUrl,
    name,
    phone,
  }: CreateAdoptionCandidateServiceRequest): Promise<CreateAdoptionCandidateServiceResponse> {
    const cpfResult = CPF.create(cpf);
    if (cpfResult.isLeft()) return left(cpfResult.value);

    const userId =
      actor.role !== Role.ADMIN ? new UniqueEntityId(actor.id) : undefined;

    const adoptioncandidate = AdoptionCandidate.create({
      userId,
      email,
      cpf: cpfResult.value,
      name,
      phone,
      identityUrl,
    });

    await this.repositoriesAdoptionCandidate.create(adoptioncandidate);

    return right({ adoptioncandidate });
  }
}
