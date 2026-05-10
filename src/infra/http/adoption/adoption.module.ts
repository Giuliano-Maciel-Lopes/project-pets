import { Module } from '@nestjs/common';
import { DataBaseModule } from '@/infra/database/database.module';
import { ServiceCreateAdoption } from '@/domain/adoption/application/service/adoption/create-service-adoption';
import { ServiceListAdoption } from '@/domain/adoption/application/service/adoption/list-service-adoption';
import { ServiceFindByIdAdoption } from '@/domain/adoption/application/service/adoption/findy-By-id-service';
import { ServiceStatusAdoption } from '@/domain/adoption/application/service/adoption/status-service-adoption';
import { ControllerCreateAdoption } from './controller/create-adoption.controller';
import { ControllerListAdoptions } from './controller/list-adoptions.controller';
import { ControllerFindAdoptionById } from './controller/find-adoption-by-id.controller';
import { ControllerStatusAdoption } from './controller/status-adoption.controller';

@Module({
  imports: [DataBaseModule],
  controllers: [
    ControllerCreateAdoption,
    ControllerListAdoptions,
    ControllerFindAdoptionById,
    ControllerStatusAdoption,
  ],
  providers: [
    ServiceCreateAdoption,
    ServiceListAdoption,
    ServiceFindByIdAdoption,
    ServiceStatusAdoption,
  ],
})
export class AdoptionModule {}
