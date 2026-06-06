import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Role, UserSafe } from '../../enterprise/entities/users';
import { RepositoriesUser } from '../repositories/repositoriesUser';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { SelfOrAdminPolicy } from '@/core/police/self-or-admin-policy';

type FindByIdResponse = Either<UnauthorizedError | NotFoundError, { user: UserSafe }>;

interface FindByIdRequest {
  actor: { id: string; role: Role };
  id: string;
}

@Injectable()
export class ServiceFindUserById {
  constructor(private repositorieUser: RepositoriesUser) {}

  async execute({ actor, id }: FindByIdRequest): Promise<FindByIdResponse> {
    const policyResult = await PolicyRunner.run(
      [new SelfOrAdminPolicy()],
      { actor, resourceOwnerId: id },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    const user = await this.repositorieUser.findById(id);

    if (!user) return left(new NotFoundError('Usuário'));

    return right({ user: user.toSafe() });
  }
}
