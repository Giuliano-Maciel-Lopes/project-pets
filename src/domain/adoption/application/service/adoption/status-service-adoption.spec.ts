import { makeAdoption } from "@/test/factories/makeAdoption";
import { InMemoryRepositoriesAdoption } from "@/test/repositories/in-memory-adoptions";
import { ServiceStatusAdoption } from "./status-service-adoption";
import { AdoptionStatus } from "@/domain/adoption/enterprise/entities/adoption";

let inMemoryRepositoriesAdoption: InMemoryRepositoriesAdoption;
let sut: ServiceStatusAdoption;

describe("Adoption", () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoption = new InMemoryRepositoriesAdoption();
    sut = new ServiceStatusAdoption(inMemoryRepositoriesAdoption);
  });

  it("deve procurar  um  adoption  corretamente", async () => {
    const adoption = makeAdoption({ status: AdoptionStatus.PENDING });

    await inMemoryRepositoriesAdoption.create(adoption);

    const result = await sut.execute({
      id: adoption.id.toString(),
      status: AdoptionStatus.APPROVED,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const adoption = result.value.adoption;
      expect(adoption.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoption.items[0]).toEqual(adoption);
      expect(adoption.status).equal(AdoptionStatus.APPROVED);
    }
  });
});
