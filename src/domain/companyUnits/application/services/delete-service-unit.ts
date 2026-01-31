import { RepositoriesUnits } from "../repositories/unistsRepositories";
import { Either, left, right, Right } from "@/core/either";
import { NotFoundError } from "@/core/erros/erro/not-found-items";


interface deleteUnitServiceRequest {
  id: string;
}

type deleteUnitServiceResponse = Either<NotFoundError, {}>;

export class ServicedeleteUnit {
  constructor(private repositoriesUnits: RepositoriesUnits) {}

  async execute({
    id,
  }: deleteUnitServiceRequest): Promise<deleteUnitServiceResponse> {
    const unit = await  this.repositoriesUnits.findById(id);

    if(!unit){
     return left(new NotFoundError("unidade"))
    }

    await this.repositoriesUnits.delete(unit.id.toString());

    return right({});
  }
}
