import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { ServiceUpdateAdoptionCandidate } from '@/domain/adoption/application/service/adoptioncandidate/update-service-adoptionCandidate';
import { ZodValidationPipe } from '../../pipes/zod-pipes';
import { uuidParamSchema } from '../../schemas/uuid-param.schema';
import {
  updateAdoptionCandidateSchema,
  UpdateAdoptionCandidateInput,
} from '../schemas/update-adoption-candidate-schema';
import { AdoptionCandidatePresenter } from '../presenters/adoption-candidate-presenter';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/infra/auth/current-user.decorator';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

@Controller('/adoption-candidates')
export class ControllerUpdateAdoptionCandidate {
  constructor(private updateCandidate: ServiceUpdateAdoptionCandidate) {}

  @Put(':id')
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(updateAdoptionCandidateSchema))
    body: UpdateAdoptionCandidateInput,
    @CurrentUser() actor: CurrentUserPayload,
  ) {
    const { name, phone, identityUrl } = body;

    const result = await this.updateCandidate.execute({
      actor,
      id,
      name,
      phone,
      identityUrl,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof UnauthorizedError) {
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
