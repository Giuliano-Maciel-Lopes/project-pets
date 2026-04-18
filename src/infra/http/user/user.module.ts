import { Module } from '@nestjs/common';
import { ControllerCreateAccount } from './controller/create-user.controller';
import { ServiceCreateUser } from '@/domain/account/application/services/crate-user-service';
import { DataBaseModule } from '@/infra/database/database.module';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';

@Module({
  imports: [DataBaseModule, CryptographyModule],
  controllers: [ControllerCreateAccount],
  providers: [ServiceCreateUser],
})
export class UserModule {}
