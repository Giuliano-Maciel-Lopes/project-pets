import { Pets } from '@/domain/pets/enterprise/entity/pets';

export class PetPresenter {
  static toHTTP(pet: Pets) {
    return {
      id: pet.id.toString(),
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age ?? null,
      sex: pet.gender ?? null,
      status: pet.status,
      isActive: pet.isActive,
      unitId: pet.unitId.toString(),
      attachments: pet.attachment.getItems().map((attachment) => ({
        id: attachment.attachmentId.toString(),
        title: attachment.title ?? null,
        link: attachment.link ?? null,
      })),
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }
}
