import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ServiceBannedAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/banned-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import {
  banAdoptionCandidateSchema,
  BanAdoptionCandidateInput,
} from '../schemas/ban-adoption-candidate-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoption-candidates')
export class ControllerBanAdoptionCandidate {
  constructor(private banCandidate: ServiceBannedAdoptionCandidate) {}

  @Patch(':id/ban')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(banAdoptionCandidateSchema))
    body: BanAdoptionCandidateInput,
  ) {
    const result = await this.banCandidate.execute({
      id,
      isBanned: body.isBanned,
      bannedReason: body.bannedReason,
    });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return {
      adoptionCandidate: AdoptionCandidatePresenter.toHTTP(
        result.value.adoptionCandidate,
      ),
    };
  }
}
