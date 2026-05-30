import { Either, left, right } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Policy } from './policy';

export interface ActorContext {
  actor: { id: string; role: Role };
}

export class RequiredRolePolicy<TContext extends ActorContext = ActorContext> implements Policy<TContext, UnauthorizedError> {
  constructor(private readonly allowed: Role[]) {}

  validate(context: TContext): Either<UnauthorizedError, void> {
    if (!this.allowed.includes(context.actor.role)) {
      return left(new UnauthorizedError());
    }
    return right(undefined);
  }
}
