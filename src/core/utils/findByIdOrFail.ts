/*
import { NotFoundError } from "../erros/erro/not-found-items";
import { Either, left, right } from "../either";

type FindByIdOrFailProps<T> = {
  id: string;
  repository: { findById(id: string): Promise<T | null> };
  entityName: string;
};

export async function findByIdOrFail<T>(
  { id, repository, entityName }: FindByIdOrFailProps<T>
): Promise<Either<NotFoundError, T>> {
  const entity = await repository.findById(id);

  if (!entity) {
    return left(new NotFoundError(entityName));
  }

  return right(entity);
}
*/
