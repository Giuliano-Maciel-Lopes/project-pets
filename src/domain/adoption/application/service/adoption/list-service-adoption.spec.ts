
import { makeAdoption } from "@/test/factories/makeAdoption";
import { InMemoryRepositoriesAdoption } from "@/test/repositories/in-memory-adoptions";
import { ServiceListAdoption } from "./list-service-adoption";

let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let sut:ServiceListAdoption;

describe("Adoption", () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();
    sut = new ServiceListAdoption(inMemoryRepositoriesAdoption);
  });

  it("deve trazer um array   de  adoption  corretamente", async () => {
    const adoption = makeAdoption();
    const adoption2 = makeAdoption();


    await inMemoryRepositoriesAdoption.create(adoption);
    await inMemoryRepositoriesAdoption.create(adoption2);

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const adoption = result.value.adoptions;
      expect(inMemoryRepositoriesAdoption.items.length).toEqual(2);
      
    }
  });
});
