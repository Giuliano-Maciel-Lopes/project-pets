import { ServiceFindUnitBySlug } from "./findBySlug-service";
import { InMemoryRepositoriesUnits } from "@/test/repositories/in-memory-units";
import { makeUnit } from "@/test/factories/makeUnit";
import { Slug } from "@/core/value-objects/slug";

let inMemoryRepositoriesUnits: InMemoryRepositoriesUnits;
let sut: ServiceFindUnitBySlug;

describe("buscar units pelo Slug", () => {
  beforeEach(() => {
    inMemoryRepositoriesUnits = new InMemoryRepositoriesUnits();
    sut = new ServiceFindUnitBySlug(inMemoryRepositoriesUnits);
  });

  it("deve achar uma unidade com base no slug", async () => {
  const unit = makeUnit({
    slug: Slug.createFromText("example-questionario"),
  });

  await inMemoryRepositoriesUnits.create(unit);

  const result = await sut.execute({
    slug: "example-questionario",
  });

  expect(result.isRight()).toBe(true);

  if (result.isRight()) {
    expect(result.value.unit.id).toEqual(unit.id);
    expect(result.value.unit.slug.value).toBe("example-questionario");
  }
});


});

