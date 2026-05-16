import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ServiceFindByIdAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/findbyid-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/infra/auth/current-user.decorator';
import { UnauthorizedOwnershipError } from '@/domain/adoption/errro/unauthorizedOwnershipError';

@Controller('/adoption-candidates')
export class ControllerFindAdoptionCandidateById {
  constructor(private findCandidateById: ServiceFindByIdAdoptionCandidate) {}

  @Get(':id')
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const result = await this.findCandidateById.execute({
      id,
      requestingUser: user,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedOwnershipError) {
        throw new ForbiddenException(error.message);
      }
      throw new NotFoundException(error.message);
    }

    return {
      adoptionCandidate: AdoptionCandidatePresenter.toHTTP(
        result.value.adoptionCandidate,
      ),
    };
  }
}
