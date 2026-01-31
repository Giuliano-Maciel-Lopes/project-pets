import { EntityMustExistPolicy } from "./EntityMustExistPolicy";
import { NotFoundError } from "../erros/erro/not-found-items";
import { makePet } from "@/test/factories/makePet";
import { Pets } from "@/domain/pets/enterprise/entity/pets";
import { PolicyContextEntity } from "./AdoptionPolicyContext";

describe("Policy: EntityMustExistPolicy", () => {
  let policy: EntityMustExistPolicy<Pets>;

  beforeEach(() => {
    policy = new EntityMustExistPolicy<Pets>(
      "Pet",
      (ctx: PolicyContextEntity) => ctx.pet
    );
  });

  it("deve retornar erro se a entidade NÃO existir", () => {
    const context: PolicyContextEntity = {
      candidate: null,
      pet: null, // pet não existe
      unit: null,
    };

    const resultado = policy.validate(context);

    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(NotFoundError);
    expect((resultado.value as NotFoundError).message).toContain("Pet");
  });

  it("deve passar se a entidade existir", () => {
    const pet = makePet();
    const context: PolicyContextEntity = {
      candidate: null,
      pet, // pet existe
      unit: null,
    };

    const resultado = policy.validate(context);

    expect(resultado.isRight()).toBe(true);
    expect(resultado.value).toBeUndefined();
  });
});
