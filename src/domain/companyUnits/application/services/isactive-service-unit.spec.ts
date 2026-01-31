import { InMemoryRepositoriesUnits } from "@/test/repositories/in-memory-units";
import { ServicetoggleActiveUnit } from "./isactive-service-unit";
import { makeUnit } from "@/test/factories/makeUnit";

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServicetoggleActiveUnit;

describe("toggleactive Units", () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServicetoggleActiveUnit(inMemoryRepositoriesUnits);
  });

  it("deve verificar se a unidade mudou o campo IsActive", async () => {
    const unit = makeUnit({ isActive: true });

    await inMemoryRepositoriesUnits.create(unit);

  const result =  await sut.execute({
      id: unit.id.toString(),
      isActive: false,
    });

    const updatedUnit = await inMemoryRepositoriesUnits.findById(
      unit.id.toString()
    );
    expect(result.isRight()).toBe(true)
    expect(updatedUnit!.isActive).toEqual(false)
    
  });
});
