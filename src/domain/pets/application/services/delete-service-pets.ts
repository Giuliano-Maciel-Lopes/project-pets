import { Either, left, right } from '@/core/either';
import { Pets } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

interface DeletePetServiceRequest {
  id: string;
}

type DeletePetServiceResponse = Either<NotFoundError, { pet: Pets }>;

export class ServiceDeletePets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    id,
  }: DeletePetServiceRequest): Promise<DeletePetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    if (!pet) {
      return left(new NotFoundError('pet'));
    }

    await this.repositoriesPets.delete(id);

    return right({ pet });
  }
}
