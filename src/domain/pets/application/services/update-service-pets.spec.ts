import { ServiceUpdatePets } from "./update-service-pets";
import { InMemoryRepositoriesPets } from "@/test/repositories/in-memory-pets";
import { makePet } from "@/test/factories/makePet";
import { PetSex } from "../../enterprise/entity/pets";
import { ServicePetAttachments } from "./attachements-service-pets";
import { InMemoryRepositoriesPetsAttachements } from "@/test/repositories/in-memory-pets-Attachement";
import { makePetAttachment } from "@/test/factories/makePetAttachemnts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let servicePetAttachments: ServicePetAttachments;
let sut: ServiceUpdatePets;

describe("ServiceUpdatePets", () => {
  beforeEach(() => {
    inMemoryRepositoriesPetsAttachements =
      new InMemoryRepositoriesPetsAttachements();
      
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets(
      inMemoryRepositoriesPetsAttachements
    );

    servicePetAttachments = new ServicePetAttachments(
      inMemoryRepositoriesPetsAttachements
    );

    sut = new ServiceUpdatePets(
      inMemoryRepositoriesPets,
      servicePetAttachments
    );
  });

  it("deve atualizar um pet corretamente", async () => {
    const pet = makePet({ name: "cacau", age: 2 });
    await inMemoryRepositoriesPets.create(pet);

    // attachments iniciais
    inMemoryRepositoriesPetsAttachements.items.push(
      makePetAttachment({
        petId: pet.id,
        attachmentId: new UniqueEntityId("1"),
      }),
      makePetAttachment({
        petId: pet.id,
        attachmentId: new UniqueEntityId("2"),
      })
    );

    const result = await sut.execute({
      id: pet.id.toString(),
      name: "new name",
      species: "new specie",
      unitId: "new unit",
      breed: "new breed",
      age: 3,
      sex: PetSex.MALE,
      attachmentIds: ["4", "5", "1"],
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const updatedPet = result.value.pet;

      expect(updatedPet.id).toBe(pet.id);
      expect(inMemoryRepositoriesPets.items[0]).toEqual(updatedPet);

      expect(updatedPet.name).toBe("new name");
      expect(updatedPet.species).toBe("new specie");
      expect(updatedPet.unitId.toString()).toBe("new unit");
      expect(updatedPet.breed).toBe("new breed");
      expect(updatedPet.age).toBe(3);
      expect(updatedPet.gender).toBe(PetSex.MALE);

      expect(updatedPet.attachment.currentItems).toHaveLength(3);

      expect(updatedPet.attachment.currentItems).toEqual([
        expect.objectContaining({
          attachmentId: new UniqueEntityId("4"),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityId("5"),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityId("1"),
        }),
      ]);
    }
  });
});
