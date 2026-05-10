import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';

export class AdoptionCandidatePresenter {
  static toHTTP(candidate: AdoptionCandidate) {
    return {
      id: candidate.id.toString(),
      name: candidate.name,
      cpf: candidate.cpf.value,
      phone: candidate.phone,
      identityUrl: candidate.identityUrl,
      isBanned: candidate.isBanned,
      bannedReason: candidate.bannedReason ?? null,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }
}
