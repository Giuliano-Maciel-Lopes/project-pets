import { AdoptionCandidate } from "@/domain/adoption/enterprise/entities/adoptionCandidate";
import { Either, left, right } from "@/core/either";
import { RepositoriesAdoptionCandidate } from "../../repositories/adoptioncandidate";
import { NotFoundError } from "@/core/erros/erro/not-found-items";

interface UpdateAdoptionCandidateServiceRequest {
  id:string
  name: string;
  phone: string;
  identityUrl: string;
}

type UpdateAdoptionCandidateServiceResponse = Either<
 NotFoundError,
  { adoptionCandidate: AdoptionCandidate }
>;

export class ServiceUpdateAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate
  ) {}

  async execute({
    id,
    identityUrl,
    name,
    phone,
  }: UpdateAdoptionCandidateServiceRequest): Promise<UpdateAdoptionCandidateServiceResponse> {
    const adoptionCandidate = await this.repositoriesAdoptionCandidate.findById(id)

    if(!adoptionCandidate){
     return left(new NotFoundError("adoption canditade"))
    }

    adoptionCandidate.update({identityUrl , name , phone})
    

    await this.repositoriesAdoptionCandidate.update(adoptionCandidate);

    return right({ adoptionCandidate });
  }
}
