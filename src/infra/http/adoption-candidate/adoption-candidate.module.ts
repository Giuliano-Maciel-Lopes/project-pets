import { Module } from '@nestjs/common';
import { DataBaseModule } from '@/infra/database/database.module';
import { ServiceCreateAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/create-service-adoptionCandidate';
import { ServiceFindByIdAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/findbyid-service-adoptionCandidate';
import { ServiceUpdateAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/update-service-adoptionCandidate';
import { ServiceBannedAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/banned-service-adoptionCandidate';
import { ServiceListAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/list-service-adoptionCandidate';
import { ControllerCreateAdoptionCandidate } from './controller/create-adoption-candidate.controller';
import { ControllerFindAdoptionCandidateById } from './controller/find-adoption-candidate-by-id.controller';
import { ControllerUpdateAdoptionCandidate } from './controller/update-adoption-candidate.controller';
import { ControllerBanAdoptionCandidate } from './controller/ban-adoption-candidate.controller';
import { ControllerListAdoptionCandidates } from './controller/list-adoption-candidates.controller';

@Module({
  imports: [DataBaseModule],
  controllers: [
    ControllerCreateAdoptionCandidate,
    ControllerFindAdoptionCandidateById,
    ControllerUpdateAdoptionCandidate,
    ControllerBanAdoptionCandidate,
    ControllerListAdoptionCandidates,
  ],
  providers: [
    ServiceCreateAdoptionCandidate,
    ServiceFindByIdAdoptionCandidate,
    ServiceUpdateAdoptionCandidate,
    ServiceBannedAdoptionCandidate,
    ServiceListAdoptionCandidate,
  ],
})
export class AdoptionCandidateModule {}
