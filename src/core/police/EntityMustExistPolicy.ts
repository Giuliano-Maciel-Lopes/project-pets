import { left, right, Either } from '@/core/either';
import { Policy } from './policy';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { PolicyContextEntity } from './AdoptionPolicyContext';

export class EntityMustExistPolicy<Entity> implements Policy<
  PolicyContextEntity,
  NotFoundError
> {
  private entityGetter: (context: PolicyContextEntity) => Entity | null;
  private entityName: string;

  constructor(
    entityName: string,
    entityGetter: (context: PolicyContextEntity) => Entity | null,
  ) {
    this.entityName = entityName;
    this.entityGetter = entityGetter;
  }

  validate(context: PolicyContextEntity): Either<NotFoundError, void> {
    const entity = this.entityGetter(context);
    if (!entity) {
      return left(new NotFoundError(this.entityName));
    }
    return right(undefined);
  }
}
