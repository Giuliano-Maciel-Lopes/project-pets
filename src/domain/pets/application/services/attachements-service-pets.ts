import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Pets } from '../../enterprise/entity/pets';
import { PetAttachment } from '../../enterprise/entity/petsAttachment';
import { RepositoryPetAttachments } from '../repositories/petsAttachement';
import { PetAttachmentlist } from '../../enterprise/entity/petsAttachmentList';

interface Props {
  pet: Pets;
  attachmentIds: string[];
}

export class ServicePetAttachments {
  constructor(private petAttachmentsRepository: RepositoryPetAttachments) {}

  private buildAttachments(
    pet: Pets,
    attachmentIds: string[],
  ): PetAttachment[] {
    return attachmentIds.map((attachmentId) =>
      PetAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        petId: pet.id,
      }),
    );
  }

  // CREATE
  create({ pet, attachmentIds }: Props) {
    if (attachmentIds.length === 0) return;

    const attachments = this.buildAttachments(pet, attachmentIds);

    pet.setattachment(new PetAttachmentlist(attachments));
  }

  //update
  async update({ pet, attachmentIds }: Props): Promise<void> {
    const currentAttachments =
      await this.petAttachmentsRepository.findManyByPetId(pet.id.toString());

    const attachmentsList = new PetAttachmentlist(currentAttachments); // começa com os iniciais buscado acima

    const newAttachments = this.buildAttachments(pet, attachmentIds); // cria os novos

    attachmentsList.update(newAttachments); // faz o update na lista de acordo com novos id

    pet.setattachment(attachmentsList);
  }

  //delete ainda vou fazer
  async removeAll(pet: Pets): Promise<void> {
    await this.petAttachmentsRepository.deleteManyByPetId(pet.id.toString());

    pet.setattachment(new PetAttachmentlist([]));
  }
}
