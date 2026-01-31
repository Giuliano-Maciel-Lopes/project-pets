import { Module } from '@nestjs/common';
import { ControllerCreateAccount } from './controller/create-user.controller';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

@Module({
  controllers: [ControllerCreateAccount],
  providers: [PrismaService],
})
export class UserModule {}
