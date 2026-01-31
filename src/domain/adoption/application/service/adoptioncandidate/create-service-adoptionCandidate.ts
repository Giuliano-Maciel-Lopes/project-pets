import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { AdoptionCandidate } from "@/domain/adoption/enterprise/entities/adoptionCandidate";
import { Either, right } from "@/core/either";
import { RepositoriesAdoptionCandidate } from "../../repositories/adoptioncandidate";
import { CPF } from "@/domain/adoption/enterprise/entities/value-objects/cpf";

interface CreateAdoptionCandidateServiceRequest {
  name: string;
  cpf: string;
  phone: string;
  identityUrl: string;
}

type CreateAdoptionCandidateServiceResponse = Either<
  null,
  { adoptioncandidate: AdoptionCandidate }
>;

export class ServiceCreateAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate
  ) {}

  async execute({
    cpf,
    identityUrl,
    name,
    phone,
  }: CreateAdoptionCandidateServiceRequest): Promise<CreateAdoptionCandidateServiceResponse> {
    const adoptioncandidate = AdoptionCandidate.create({
      cpf:CPF.create(cpf), // normaliza po cpf para ficar padrao sempre
      name,
      phone,
      identityUrl,
    });

    await this.repositoriesAdoptionCandidate.create(adoptioncandidate);

    return right({ adoptioncandidate });
  }
}
