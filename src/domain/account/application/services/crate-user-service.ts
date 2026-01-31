import { Either, left, right } from "@/core/either";
import { User } from "../../enterprise/entities/users";
import { RepositoriesUser } from "../repositories/repositoriesUser";
import { ExystUserWitchEmailError } from "../../erros/exisistyUserwithEmail";
import { HashGenerator } from "../encryption/hash-generator";

interface CreateUserServiceRequest {
  name: string;
  password: string;
  email: string;
}

type CreateUserServiceResponse = Either<
  ExystUserWitchEmailError,
  { user: User }
>;

export class ServiceCreateUser {
  constructor(
    private repositorieUser: RepositoriesUser,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    email,
    name,
    password,
  }: CreateUserServiceRequest): Promise<CreateUserServiceResponse> {
    const userwithSameEmail = await this.repositorieUser.findByEmail(email);

    if (userwithSameEmail) {
      return left(new ExystUserWitchEmailError());
    }

   const hashPassword =  await this.hashGenerator.hash(password)

    const user = User.create({ email, name, password:hashPassword });

   await this.repositorieUser.create(user)
    return right({ user });
  }
}
