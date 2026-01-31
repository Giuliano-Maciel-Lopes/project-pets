import { AdoptionCandidate } from "@/domain/adoption/enterprise/entities/adoptionCandidate";
import { Either, left, right } from "@/core/either";
import { RepositoriesAdoptionCandidate } from "../../repositories/adoptioncandidate";
import { NotFoundError } from "@/core/erros/erro/not-found-items";

interface BannedAdoptionCandidateServiceRequest {
  id: string;
  isBanned: boolean;
  bannedReason: string;
}

type BannedAdoptionCandidateServiceResponse = Either<
  NotFoundError,
  { adoptionCandidate: AdoptionCandidate }
>;

export class ServiceBannedAdoptionCandidate {
  constructor(
    private repositoriesAdoptionCandidate: RepositoriesAdoptionCandidate
  ) {}

  async execute({
    id,
    bannedReason,
    isBanned,
  }: BannedAdoptionCandidateServiceRequest): Promise<BannedAdoptionCandidateServiceResponse> {
    const adoptionCandidate = await this.repositoriesAdoptionCandidate.findById(
      id
    );

    if (!adoptionCandidate) {
      return left(new NotFoundError("adoption canditade"));
    }

    adoptionCandidate.banned({ isBanned, bannedReason });

    await this.repositoriesAdoptionCandidate.setBlock(adoptionCandidate);

    return right({ adoptionCandidate });
  }
}
