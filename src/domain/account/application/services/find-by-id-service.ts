import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { User } from '../../enterprise/entities/users';
import { RepositoriesUser } from '../repositories/repositoriesUser';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

type FindByIdResponse = Either<NotFoundError, { user: User }>;

@Injectable()
export class ServiceFindUserById {
  constructor(private repositorieUser: RepositoriesUser) {}

  async execute(id: string): Promise<FindByIdResponse> {
    const user = await this.repositorieUser.findById(id);

    if (!user) return left(new NotFoundError('Usuário'));

    return right({ user });
  }
}
