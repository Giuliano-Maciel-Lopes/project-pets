import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Pets } from '../../enterprise/entity/pets';
import { RepositoriesPets } from '../repositories/pets';
import { NotFoundError } from '@/core/erros/erro/not-found-items';

interface IsActivePetServiceRequest {
  id: string;
  isActive: boolean;
}

type IsActivePetServiceResponse = Either<NotFoundError, { pet: Pets }>;

@Injectable()
export class ServiceIsActivePets {
  constructor(private repositoriesPets: RepositoriesPets) {}

  async execute({
    id,
    isActive,
  }: IsActivePetServiceRequest): Promise<IsActivePetServiceResponse> {
    const pet = await this.repositoriesPets.findById(id);

    if (!pet) {
      return left(new NotFoundError('pet'));
    }

    pet.setActive(isActive);

    await this.repositoriesPets.update(pet);

    return right({ pet });
  }
}
