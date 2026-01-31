import { InMemoryRepositoriesUnits } from "@/test/repositories/in-memory-units";
import { ServiceCreateUnit } from "./create-service-unit";
import { DuplicateSlugNameError } from "@/core/erros/erro/duplicateEntity";
import { makeUnit } from "@/test/factories/makeUnit";

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceCreateUnit;

describe("Create Units", () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceCreateUnit(inMemoryRepositoriesUnits);
  });

  it("deve criar uma unidade corretamente", async () => {
    const result = await sut.execute({
      name: "Unidade Teste",
      address: "Rua A, 123",
      city: "São Paulo",
      state: "SP",
      managerId: "1",
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const unit = result.value.unit;
      expect(unit.id).toBeTruthy();
      expect(inMemoryRepositoriesUnits.items[0]).toEqual(unit);
      expect(unit.slug.value).toBe("unidade-teste");
    }
  });
  it("erro ao criar unidade com mesmo nome por cuasa do slug ", async () => {
    const unit = makeUnit({
      name: "Unidade teste",
    });
    inMemoryRepositoriesUnits.create(unit);


   const result = await  sut.execute({
        name: "Unidade Teste",
        address: "Rua A, 123",
        city: "São Paulo",
        state: "SP",
        managerId: "1",
      })
  expect(result.isLeft()).toBe(true);
   expect(result.value).toBeInstanceOf(DuplicateSlugNameError);

   
  });
});
