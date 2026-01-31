
import { makeAdoption } from "@/test/factories/makeAdoption";
import { InMemoryRepositoriesAdoption } from "@/test/repositories/in-memory-adoptions";
import { ServiceFindByIdAdoption } from "./findy-By-id-service";

let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let sut: ServiceFindByIdAdoption;

describe("Adoption", () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();
    sut = new ServiceFindByIdAdoption(inMemoryRepositoriesAdoption);
  });

  it("deve procurar  um  adoption  corretamente", async () => {
    const adoption = makeAdoption();


    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({ id: adoption.id.toString() });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const adoption = result.value.adoption;
      expect(adoption.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoption.items[0]).toEqual(adoption);
      
    }
  });
});


