import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { User, UserProps } from '@/domain/account/enterprise/entities/users';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MapperPrismaUser } from '@/infra/database/prisma/mappers/user-mappers';

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId,
): User {
  return User.create(
    {
      email: 'giulindo@gmail.com',
      name: 'giu',
      password: '123456',
      ...override,
    },
    id,
  );
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);

    await this.prisma.user.create({
      data: MapperPrismaUser.toPrisma(user),
    });

    return user;
  }
}
