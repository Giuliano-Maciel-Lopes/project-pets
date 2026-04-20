import { User as PrismaUser, Prisma, Role } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/account/enterprise/entities/users'

export type UserSafe = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class MapperPrismaUser{
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: raw.role as any,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
  static toDomainSafe(raw: Omit<PrismaUser, 'password'>): UserSafe {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}
}

