import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { User, UserProps } from "@/domain/account/enterprise/entities/users";

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId
): User {
  const user = User.create({
    email:"giulindo@gmail.com",
    name:"giu",
    password:"123456",
    ...override,
  });
  return user;
}
