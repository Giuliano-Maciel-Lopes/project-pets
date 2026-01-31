import { ServiceFindByIdPets } from "./findById-service-pets";
import { InMemoryRepositoriesPets } from "@/test/repositories/in-memory-pets";
import { makePet } from "@/test/factories/makePet";

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let sut: ServiceFindByIdPets;

describe("Pets", () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    sut = new ServiceFindByIdPets(inMemoryRepositoriesPets);
  });

  it("deve procurar  um  pet  corretamente", async () => {
    const pet = makePet({ name: "cacau" });


    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({ id: pet.id.toString() });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const pet = result.value.pet;
      expect(pet.id).toBeTruthy();
      expect(inMemoryRepositoriesPets.items[0]).toEqual(pet);
      expect(inMemoryRepositoriesPets.items[0].name).toEqual("cacau");
      
    }
  });
});
