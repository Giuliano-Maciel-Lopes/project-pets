import {
  AdoptionCandidate,
  AdoptionCandidateProps,
} from "@/domain/adoption/enterprise/entities/adoptionCandidate";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CPF } from "@/domain/adoption/enterprise/entities/value-objects/cpf";

export function makeAdoptionCandidate(
  override: Partial<AdoptionCandidateProps> = {},
  id?: UniqueEntityId
): AdoptionCandidate {
  const canndidate = AdoptionCandidate.create({
    name: "GiulianoLindo",
    cpf: CPF.create("123.456.789-09"),
    phone: "11999999999",
    identityUrl: "http://url-da-identidade.com/foto.jpg",
    isBanned: false,
    ...override,
  });
  return canndidate;
}
