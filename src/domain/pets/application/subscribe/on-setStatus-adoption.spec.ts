import { InMemoryRepositoriesPets } from "@/test/repositories/in-memory-pets";
import { InMemoryRepositoriesAdoption } from "@/test/repositories/in-memory-adoptions";
import { ServiceSetStatusPets } from "@/domain/pets/application/services/setStatus-service-pets";
import { OnSetStatusAdoption } from "./on-setStatus-adoption";
import { PetStatus } from "@/domain/pets/enterprise/entity/pets";
import { makePet } from "@/test/factories/makePet";
import { makeAdoption } from "@/test/factories/makeAdoption";
import { waitFor } from "@/test/utils/wait-for";
import { AdoptionStatus } from "@/domain/adoption/enterprise/entities/adoption";

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let serviceSetStatusPets: ServiceSetStatusPets;

let executeSpy: ReturnType<typeof vi.spyOn>;

describe("OnSetStatusAdoption Event", () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();

    serviceSetStatusPets = new ServiceSetStatusPets(inMemoryRepositoriesPets);

    executeSpy = vi.spyOn(serviceSetStatusPets, "execute");

    new OnSetStatusAdoption(serviceSetStatusPets);
  });

  it("muda o status do pet para avalibale(disponivel) quando cria e rejeitada uma adoçao ", async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    const adoption = makeAdoption({
      petId: pet.id,
    });
    await inMemoryRepositoriesAdoption.create(adoption);

    adoption.setStatus(AdoptionStatus.REJECTED);
    await inMemoryRepositoriesAdoption.update(adoption);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith({
        id: pet.id.toString(),
        status: PetStatus.AVAILABLE,
      });
    });

    const updatedPet = await inMemoryRepositoriesPets.findById(
      pet.id.toString()
    );

    expect(updatedPet?.status).toBe(PetStatus.AVAILABLE);
  });
    it("muda o status do pet para unavaliable(indisponivel) quando cria e aceita uma adoçao ", async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    const adoption = makeAdoption({
      petId: pet.id,
    });
    await inMemoryRepositoriesAdoption.create(adoption);

    adoption.setStatus(AdoptionStatus.APPROVED);
    await inMemoryRepositoriesAdoption.update(adoption);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith({
        id: pet.id.toString(),
        status: PetStatus.UNAVAILABLE,
      });
    });

    const updatedPet = await inMemoryRepositoriesPets.findById(
      pet.id.toString()
    );

    expect(updatedPet?.status).toBe(PetStatus.UNAVAILABLE);
  });
});
