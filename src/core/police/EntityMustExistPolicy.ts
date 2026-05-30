import { left, right, Either } from '@/core/either';
import { Policy } from './policy';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

export class EntityMustExistPolicy<TContext, Entity> implements Policy<TContext, NotFoundError> {
  constructor(
    private readonly entityName: string,
    private readonly entityGetter: (context: TContext) => Entity | null | undefined,
  ) {}

  validate(context: TContext): Either<NotFoundError, void> {
    const entity = this.entityGetter(context);
    if (!entity) {
      return left(new NotFoundError(this.entityName));
    }
    return right(undefined);
  }
}
