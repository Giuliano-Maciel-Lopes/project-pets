import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { PetAttachment, PetAttachmentProps } from "@/domain/pets/enterprise/entity/petsAttachment";

export function makePetAttachment(
  override: Partial<PetAttachmentProps> = {},
  id?: UniqueEntityId
) {
  const pet = PetAttachment.create(
    {
    attachmentId:new UniqueEntityId(),
    petId: new UniqueEntityId(),
    ...override
    },
    id
  );

  return pet;
}
