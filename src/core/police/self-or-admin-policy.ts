import { Either, left, right } from '@/core/either';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { Policy } from './policy';

export interface SelfOrAdminContext {
  actor: { id: string; role: Role };
  resourceOwnerId: string;
}

export class SelfOrAdminPolicy implements Policy<SelfOrAdminContext, UnauthorizedError> {
  validate(context: SelfOrAdminContext): Either<UnauthorizedError, void> {
    if (!context.actor) return left(new UnauthorizedError());

    if (context.actor.role === Role.ADMIN) return right(undefined);

    if (context.actor.id === context.resourceOwnerId) return right(undefined);

    return left(new UnauthorizedError());
  }
}
