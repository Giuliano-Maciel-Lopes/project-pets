import { InMemoryRepositoriesAdoptionCandidate } from "@/test/repositories/in-memory-adoptionCandidate";
import { ServiceCreateAdoptionCandidate } from "./create-service-adoptionCandidate";
import { CPF } from "@/domain/adoption/enterprise/entities/value-objects/cpf";

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceCreateAdoptionCandidate;

describe("AdoptionCandidate Service", () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate = new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceCreateAdoptionCandidate(inMemoryRepositoriesAdoptionCandidate);
  });

  it("deve criar um candidate corretamente", async () => {
    const candidateData = {
      name: "Giuliano",
      cpf: "123.456.789-09",
      phone: "11999999999",
      identityUrl: "http://@giulianoLindo/foto.jpg",
    };

    const result = await sut.execute(candidateData);

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const adoptionCandidate = result.value.adoptioncandidate;

      expect(adoptionCandidate.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoptionCandidate.items[0]).toEqual(adoptionCandidate);
      expect(adoptionCandidate.cpf.value).toBe("12345678909");

      // Verifica outros campos
      expect(adoptionCandidate.name).toBe(candidateData.name);
      expect(adoptionCandidate.phone).toBe(candidateData.phone);
      expect(adoptionCandidate.identityUrl).toBe(candidateData.identityUrl);
      expect(adoptionCandidate.isBanned).toBe(false); // padrão da entidade
    }
  });
});
