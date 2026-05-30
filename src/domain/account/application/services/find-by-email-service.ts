import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { User, Role } from '../../enterprise/entities/users';
import { RepositoriesUser } from '../repositories/repositoriesUser';
import { NotFoundError } from '@/core/erros/erro/not-found-items';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';
import { PolicyRunner } from '@/core/police/policeRun';
import { RequiredRolePolicy } from '@/core/police/required-role-policy';

type FindByEmailResponse = Either<UnauthorizedError | NotFoundError, { user: User }>;

interface FindByEmailRequest {
  actor: { id: string; role: Role };
  email: string;
}

@Injectable()
export class ServiceFindUserByEmail {
  constructor(private repositorieUser: RepositoriesUser) {}

  async execute({ actor, email }: FindByEmailRequest): Promise<FindByEmailResponse> {
    const policyResult = await PolicyRunner.run(
      [new RequiredRolePolicy([Role.ADMIN])],
      { actor },
    );

    if (policyResult.isLeft()) return left(policyResult.value);

    const user = await this.repositorieUser.findByEmail(email);

    if (!user) return left(new NotFoundError('Usuário'));

    return right({ user });
  }
}
