import { Adoption } from '@/domain/adoption/enterprise/entities/adoption';

export class AdoptionPresenter {
  static toHTTP(adoption: Adoption) {
    return {
      id: adoption.id.toString(),
      petId: adoption.petId.toString(),
      adopterId: adoption.adopterId.toString(),
      unityId: adoption.unityId.toString(),
      status: adoption.status,
      createdAt: adoption.createdAt,
      updatedAt: adoption.updatedAt,
    };
  }
}
