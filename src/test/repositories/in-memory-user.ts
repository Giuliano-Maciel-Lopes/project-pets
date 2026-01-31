import { User } from "@/domain/account/enterprise/entities/users";
import { RepositoriesUser } from "@/domain/account/application/repositories/repositoriesUser";

export class InMemoryRepositoriesUser implements RepositoriesUser {
  public items: User[] = [];

  async create(user: User): Promise<void> {
    this.items.push(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find(u => u.email === email);
    return user ?? null;
  }


  async findById(id: string): Promise<User | null> {
    const user = this.items.find(u => u.id.toString() === id);
    return user ?? null;
  }


}
