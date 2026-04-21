import { Module } from '@nestjs/common';
import { DataBaseModule } from '@/infra/database/database.module';
import { ServiceCreatePets } from '@/domain/pets/application/services/create-service-pets';
import { ServiceFindByIdPets } from '@/domain/pets/application/services/findById-service-pets';
import { ServiceListPets } from '@/domain/pets/application/services/list-service-pets';
import { ServiceUpdatePets } from '@/domain/pets/application/services/update-service-pets';
import { ServiceDeletePets } from '@/domain/pets/application/services/delete-service-pets';
import { ServiceIsActivePets } from '@/domain/pets/application/services/isActive-service-pets';
import { ServiceSetStatusPets } from '@/domain/pets/application/services/setStatus-service-pets';
import { ServicePetAttachments } from '@/domain/pets/application/services/attachements-service-pets';
import { ControllerCreatePet } from './controller/create-pet.controller';
import { ControllerFindPetById } from './controller/find-pet-by-id.controller';
import { ControllerListPets } from './controller/list-pets.controller';
import { ControllerUpdatePet } from './controller/update-pet.controller';
import { ControllerDeletePet } from './controller/delete-pet.controller';
import { ControllerSetStatusPet } from './controller/set-status-pet.controller';
import { ControllerToggleActivePet } from './controller/toggle-active-pet.controller';

@Module({
  imports: [DataBaseModule],
  controllers: [
    ControllerCreatePet,
    ControllerFindPetById,
    ControllerListPets,
    ControllerUpdatePet,
    ControllerDeletePet,
    ControllerSetStatusPet,
    ControllerToggleActivePet,
  ],
  providers: [
    ServiceCreatePets,
    ServiceFindByIdPets,
    ServiceListPets,
    ServiceUpdatePets,
    ServiceDeletePets,
    ServiceIsActivePets,
    ServiceSetStatusPets,
    ServicePetAttachments,
  ],
})
export class PetsModule {}
