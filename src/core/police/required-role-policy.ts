import { Either, left, right } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Policy } from './policy';

export interface ActorContext {
  actor: { id: string; role: Role };
}

export class RequiredRolePolicy implements Policy<ActorContext, UnauthorizedError> {
  constructor(private readonly allowed: Role[]) {}

  validate(context: ActorContext): Either<UnauthorizedError, void> {
    if (!this.allowed.includes(context.actor.role)) {
      return left(new UnauthorizedError());
    }
    return right(undefined);
  }
}
