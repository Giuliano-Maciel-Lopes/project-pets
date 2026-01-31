import { NotFoundError } from "@/core/erros/erro/not-found-items";
import { AdoptionCandidate } from "@/domain/adoption/enterprise/entities/adoptionCandidate";
import { Either, left, right } from "@/core/either";
import { RepositoriesAdoptionCandidate } from "../../repositories/adoptioncandidate";


interface CreateAdoptionCandidateServiceRequest {
  id:string
}

type CreateAdoptionCandidateServiceResponse = Either<
  NotFoundError,
  { adoptionCandidate: AdoptionCandidate }
>;

export class ServiceFindByIdAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate
  ) {}

  async execute({
   id
  }: CreateAdoptionCandidateServiceRequest): Promise<CreateAdoptionCandidateServiceResponse> {
  const adoptionCandidate =  await this.repositoriesAdoptionCandidate.findById(id)

  if(!adoptionCandidate){
    return left(new NotFoundError("adoptioncanditate"))
  }
    

    return right({ adoptionCandidate });
  }
}
