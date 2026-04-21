import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UnitModule } from './unit/unit.module';

@Module({
  imports: [UserModule, UnitModule],
})
export class HttpModule {}
