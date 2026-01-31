import { User } from "../../enterprise/entities/users";

export interface RepositoriesUser {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
