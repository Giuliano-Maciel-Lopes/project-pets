import { Module } from '@nestjs/common';
import { DataBaseModule } from '@/infra/database/database.module';
import { ServiceCreateUnit } from '@/domain/companyUnits/application/services/create-service-unit';
import { ServiceFindUnitById } from '@/domain/companyUnits/application/services/findById-service';
import { ServiceFindUnitBySlug } from '@/domain/companyUnits/application/services/findBySlug-service';
import { ServiceListUnits } from '@/domain/companyUnits/application/services/zlist-service-unit';
import { ServiceUpdateUnit } from '@/domain/companyUnits/application/services/update-service-unit';
import { ServicedeleteUnit } from '@/domain/companyUnits/application/services/delete-service-unit';
import { ServicetoggleActiveUnit } from '@/domain/companyUnits/application/services/isactive-service-unit';
import { ControllerCreateUnit } from './controller/create-unit.controller';
import { ControllerFindUnitById } from './controller/find-unit-by-id.controller';
import { ControllerFindUnitBySlug } from './controller/find-unit-by-slug.controller';
import { ControllerListUnits } from './controller/list-units.controller';
import { ControllerUpdateUnit } from './controller/update-unit.controller';
import { ControllerDeleteUnit } from './controller/delete-unit.controller';
import { ControllerToggleActiveUnit } from './controller/toggle-active-unit.controller';

@Module({
  imports: [DataBaseModule],
  controllers: [
    ControllerCreateUnit,
    ControllerFindUnitById,
    ControllerFindUnitBySlug,
    ControllerListUnits,
    ControllerUpdateUnit,
    ControllerDeleteUnit,
    ControllerToggleActiveUnit,
  ],
  providers: [
    ServiceCreateUnit,
    ServiceFindUnitById,
    ServiceFindUnitBySlug,
    ServiceListUnits,
    ServiceUpdateUnit,
    ServicedeleteUnit,
    ServicetoggleActiveUnit,
  ],
})
export class UnitModule {}
