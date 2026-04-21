import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UnitModule } from './unit/unit.module';
import { PetsModule } from './pets/pets.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [UserModule, UnitModule, PetsModule, AttachmentsModule],
})
export class HttpModule {}
