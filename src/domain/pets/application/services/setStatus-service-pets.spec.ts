import { makePet } from "@/test/factories/makePet";
import { ServiceSetStatusPets } from "./setStatus-service-pets";
import { InMemoryRepositoriesPets } from "@/test/repositories/in-memory-pets";
import { PetStatus } from "../../enterprise/entity/pets";

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let sut: ServiceSetStatusPets;

describe("ServiceDeletePets", () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    sut = new ServiceSetStatusPets(inMemoryRepositoriesPets);
  });

  it("deve alterar o status um pet corretamente", async () => {
    const pet = makePet({
      status:PetStatus.ANALYSIS
    });
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({ id: pet.id.toString() ,status:PetStatus.UNAVAILABLE });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(inMemoryRepositoriesPets.items[0].status).toBe(PetStatus.UNAVAILABLE);
    }
  });
});
