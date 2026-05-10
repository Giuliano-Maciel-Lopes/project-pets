import {
  Body,
  Controller,
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
import { Roles } from '@/infra/auth/roles';
import { Role } from '@/domain/account/enterprise/entities/users';

@Controller('/adoption-candidates')
export class ControllerUpdateAdoptionCandidate {
  constructor(private updateCandidate: ServiceUpdateAdoptionCandidate) {}

  @Put(':id')
  @Roles(Role.ADMIN)
  async handle(
    @Param('id', new ZodValidationPipe(uuidParamSchema)) id: string,
    @Body(new ZodValidationPipe(updateAdoptionCandidateSchema))
    body: UpdateAdoptionCandidateInput,
  ) {
    const { name, phone, identityUrl } = body;

    const result = await this.updateCandidate.execute({
      id,
      name,
      phone,
      identityUrl,
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
