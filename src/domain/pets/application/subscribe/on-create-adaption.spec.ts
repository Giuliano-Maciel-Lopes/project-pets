import { InMemoryRepositoriesPets } from "@/test/repositories/in-memory-pets";
import { InMemoryRepositoriesAdoption } from "@/test/repositories/in-memory-adoptions";
import { ServiceSetStatusPets } from "@/domain/pets/application/services/setStatus-service-pets";
import { OncreateAdoption } from "./on-create-adaption";
import { PetStatus } from "@/domain/pets/enterprise/entity/pets";
import { makePet } from "@/test/factories/makePet";
import { makeAdoption } from "@/test/factories/makeAdoption";
import { waitFor } from "@/test/utils/wait-for";

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let serviceSetStatusPets: ServiceSetStatusPets;

let executeSpy: ReturnType<typeof vi.spyOn>;

describe("OnCreateAdoption Event", () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();

    serviceSetStatusPets = new ServiceSetStatusPets(
      inMemoryRepositoriesPets,
    );

    executeSpy = vi.spyOn(serviceSetStatusPets, "execute");

    
    new OncreateAdoption(serviceSetStatusPets);
  });

  it("muda o status do pet para ANALYSIS quando cria um adoption", async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    const adoption = makeAdoption({
      petId: pet.id,
    });

    await inMemoryRepositoriesAdoption.create(adoption);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith({
        id: pet.id.toString(),
        status: PetStatus.ANALYSIS,
      });
    });

    const updatedPet = await inMemoryRepositoriesPets.findById(
      pet.id.toString(),
    );

    expect(updatedPet?.status).toBe(PetStatus.ANALYSIS);
  });
});
