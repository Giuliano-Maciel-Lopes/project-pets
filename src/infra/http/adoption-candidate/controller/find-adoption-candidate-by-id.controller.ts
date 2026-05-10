import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServiceFindByIdAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/findbyid-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoption-candidates')
export class ControllerFindAdoptionCandidateById {
  constructor(private findCandidateById: ServiceFindByIdAdoptionCandidate) {}

  @Get(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
  ) {
    const result = await this.findCandidateById.execute({ id });

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
