import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UnitModule } from './unit/unit.module';
import { PetsModule } from './pets/pets.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { AdoptionModule } from './adoption/adoption.module';
import { AdoptionCandidateModule } from './adoption-candidate/adoption-candidate.module';

@Module({
  imports: [UserModule, UnitModule, PetsModule, AttachmentsModule, AdoptionModule, AdoptionCandidateModule],
})
export class HttpModule {}
