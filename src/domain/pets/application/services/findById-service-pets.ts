import { Either, left, right } from '@/core/either';
import { Pets } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

interface FindByIdPetServiceRequest {
  id: string;
}

type FindByIdPetServiceResponse = Either<NotFoundError, { pet: Pets }>;

export class ServiceFindByIdPets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    id,
  }: FindByIdPetServiceRequest): Promise<FindByIdPetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    if (!pet) {
      return left(new NotFoundError('pet'));
    }

    return right({ pet });
  }
}
