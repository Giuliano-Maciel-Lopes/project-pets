import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { PetSex } from "../pets";

export interface UpdatePetProps {
  id:UniqueEntityId
  name: string;
  species: string;
  unitId: UniqueEntityId;
  breed: string;
  age?: number;
  sex?: PetSex;
}
