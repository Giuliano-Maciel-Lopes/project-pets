import { Pets } from "@/domain/pets/enterprise/entity/pets";
import { Units } from "@/domain/companyUnits/enterprise/entities/unity";
import { AdoptionCandidate } from "../../domain/adoption/enterprise/entities/adoptionCandidate";

export type PolicyContextEntity = {
  candidate: AdoptionCandidate | null;
  pet: Pets | null;
  unit: Units | null;
  
};
