import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { RepositoriesUser } from '@/domain/account/application/repositories/repositoriesUser';
import { User } from '@/domain/account/enterprise/entities/users';
import { MapperPrismaUser } from '../mappers/user-mappers';

@Injectable()
export class PrismaRepositoriesUser implements RepositoriesUser {
  
  constructor(private prisma: PrismaService) {}

 async findByEmail(email: string): Promise<User | null> {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  return MapperPrismaUser.toDomain(user);
}

async findById(id: string): Promise<User | null> {
  const user = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return MapperPrismaUser.toDomain(user);
}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: MapperPrismaUser.toPrisma(user),
    });
  }
}
