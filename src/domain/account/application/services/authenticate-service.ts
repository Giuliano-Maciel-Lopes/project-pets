import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { RepositoriesUser } from '../repositories/repositoriesUser';
import { WrongCredentialsError } from '../../erros/wrong-credentials-error';
import { HashComparer } from '../encryption/hash-comparer';
import { EncrypterToken } from '../encryption/encrypterToken';

interface AuthenticateUserServiceRequest {
  password: string;
  email: string;
}

type AuthenticateUserServiceResponse = Either<
  WrongCredentialsError,
  { accessToken: string }
>;

@Injectable()
export class ServiceAuthenticateUser {
  constructor(
    private repositorieUser: RepositoriesUser,
    private hashcomparer: HashComparer,
    private encrypterToken: EncrypterToken,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserServiceRequest): Promise<AuthenticateUserServiceResponse> {
    const user = await this.repositorieUser.findByEmail(email);

    if (!user || !(await this.hashcomparer.compare(password, user.password))) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypterToken.encryptToken({
      sub: user.id.toString(),
      role: user.role,
    });

    return right({ accessToken });
  }
}
