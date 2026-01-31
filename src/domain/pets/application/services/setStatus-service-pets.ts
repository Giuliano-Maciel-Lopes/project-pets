import { Either, left, right } from "@/core/either";
import { Pets, PetStatus } from "../../enterprise/entity/pets";
import { RepositoriesPets } from "../repositories/pets";
import { NotFoundError } from "@/core/erros/erro/not-found-items";

interface SetStatusPetServiceRequest {
  id: string;
 status:PetStatus
}

type SetStatusPetServiceResponse = Either<NotFoundError, { pet: Pets }>;

export class ServiceSetStatusPets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    id, status
  }: SetStatusPetServiceRequest): Promise<SetStatusPetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    if (!pet) {
      return left(new NotFoundError("pet"));
    }

    pet.setStatus(status)

    await this.repositoriesPets.update(pet);

    return right({ pet });
  }
}
