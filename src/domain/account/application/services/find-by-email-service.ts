import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { User } from '../../enterprise/entities/users';
import { RepositoriesUser } from '../repositories/repositoriesUser';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

type FindByEmailResponse = Either<NotFoundError, { user: User }>;

@Injectable()
export class ServiceFindUserByEmail {
  constructor(private repositorieUser: RepositoriesUser) {}

  async execute(email: string): Promise<FindByEmailResponse> {
    const user = await this.repositorieUser.findByEmail(email);

    if (!user) return left(new NotFoundError('Usuário'));

    return right({ user });
  }
}
