import { Slug } from "@/core/value-objects/slug";
import { RepositoriesUnits } from "../../domain/companyUnits/application/repositories/unistsRepositories";
import { Either, left, right } from "@/core/either";
import { DuplicateSlugNameError } from "../erros/erro/duplicateEntity";

type Props = {
  entityName:string
  id?: string; // id da entydade atual (opcional, para update)
  name: string;
  repositoriesUnits: RepositoriesUnits;
};

export async function createUniqueUnitSlug({
  entityName, 
  name,
  id,
  repositoriesUnits,
}: Props): Promise<Either<DuplicateSlugNameError, Slug>> {
  
  const slug = Slug.createFromText(name);

  const existingUnit = await repositoriesUnits.findBySlug(slug.value);

  if (existingUnit && existingUnit.id.toString() !== id) {
    return left(new DuplicateSlugNameError(entityName , name));
  }

  return right(slug);
}
