import { InMemoryRepositoriesUnits } from "@/test/repositories/in-memory-units";
import { ServiceUpdateUnit } from "./update-service-unit";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { makeUnit } from "@/test/factories/makeUnit";

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceUpdateUnit;

describe("UPDATE Units", () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceUpdateUnit(inMemoryRepositoriesUnits);
  });

  it("Deve fazer update e slug mudar também", async () => {
    // Cria a unidade inicial
    const unit = makeUnit({ name: "Unidade teste" });
    await inMemoryRepositoriesUnits.create(unit);

    const updateData = {
      id: unit.id.toString(),
      name: "Unidade Atualizada",
      address: "Rua B, 456",
      city: "Rio de Janeiro",
      state: "RJ",
      managerId: new UniqueEntityId().toString(), // novo managerId para teste
    };

   const result = await sut.execute(updateData);

    
    const updatedUnit = await inMemoryRepositoriesUnits.findById(unit.id.toString());

     expect(result.isRight()).toBe(true);
    expect(updatedUnit).toBeDefined();
    expect(updatedUnit!.name).toBe(updateData.name);
    expect(updatedUnit!.address).toBe(updateData.address);
    expect(updatedUnit!.city).toBe(updateData.city);
    expect(updatedUnit!.state).toBe(updateData.state);
    expect(updatedUnit!.managerId.toString()).toBe(updateData.managerId);
    expect(updatedUnit!.slug.value).toBe("unidade-atualizada");
  });
});
