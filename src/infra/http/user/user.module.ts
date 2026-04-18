import { Module } from '@nestjs/common';
import { ControllerCreateAccount } from './controller/create-user.controller';
import { ControllerFindUserById } from './controller/find-by-id.controller';
import { ControllerFindUserByEmail } from './controller/find-by-email.controller';
import { ControllerAuthenticate } from './controller/authenticate.controller';
import { ServiceCreateUser } from '@/domain/account/application/services/crate-user-service';
import { ServiceFindUserById } from '@/domain/account/application/services/find-by-id-service';
import { ServiceFindUserByEmail } from '@/domain/account/application/services/find-by-email-service';
import { ServiceAuthenticateUser } from '@/domain/account/application/services/authenticate-service';
import { DataBaseModule } from '@/infra/database/database.module';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';

@Module({
  imports: [DataBaseModule, CryptographyModule],
  controllers: [
    ControllerCreateAccount,
    ControllerFindUserById,
    ControllerFindUserByEmail,
    ControllerAuthenticate,
  ],
  providers: [
    ServiceCreateUser,
    ServiceFindUserById,
    ServiceFindUserByEmail,
    ServiceAuthenticateUser,
  ],
})
export class UserModule {}
