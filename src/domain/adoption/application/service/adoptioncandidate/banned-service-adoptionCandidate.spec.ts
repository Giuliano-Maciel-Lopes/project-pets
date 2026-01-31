import { InMemoryRepositoriesAdoptionCandidate } from "@/test/repositories/in-memory-adoptionCandidate";
import { ServiceBannedAdoptionCandidate } from "./banned-service-adoptionCandidate";
import { makeAdoptionCandidate } from "@/test/factories/makeAdoptionCandidate";

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceBannedAdoptionCandidate;

describe("AdoptionCandidate Service", () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate =
      new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceBannedAdoptionCandidate(
      inMemoryRepositoriesAdoptionCandidate
    );
  });

  it("deve atualizar um candidate corretamente", async () => {
    const adoptionCandidate = makeAdoptionCandidate({
      isBanned: false,
    });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      id: adoptionCandidate.id.toString(),
      bannedReason: "usuario foi banido devido a desrepeito com funcionario",
      isBanned: true,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const banneddCandidate = result.value.adoptionCandidate;

      expect(banneddCandidate.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoptionCandidate.items[0]).toEqual(
        banneddCandidate
      );
      expect(banneddCandidate.isBanned).toBe(true);
      expect(banneddCandidate.bannedReason).toBe(
        "usuario foi banido devido a desrepeito com funcionario"
      );
    }
  });
});
