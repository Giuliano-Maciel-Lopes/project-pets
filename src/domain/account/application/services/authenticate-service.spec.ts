import { InMemoryRepositoriesUser } from "@/test/repositories/in-memory-user";
import { ServiceAuthenticateUser } from "./authenticate-service";
import { FakeHash } from "@/test/cryptography/fakehash";
import { FakeToken } from "@/test/cryptography/fakeToken";
import { makeUser } from "@/test/factories/makeUser";

let inMemoryRepositoriesUser: InMemoryRepositoriesUser;
let sut: ServiceAuthenticateUser;
let fakeHash: FakeHash;
let fakeToken: FakeToken;

describe("User Service", () => {
  beforeEach(() => {
    inMemoryRepositoriesUser = new InMemoryRepositoriesUser();
    fakeHash = new FakeHash();
    fakeToken = new FakeToken();

    sut = new ServiceAuthenticateUser(
      inMemoryRepositoriesUser,
      fakeHash,
      fakeToken
    );
  });

  it("deve gerar um token", async () => {
    const passwordPlain = "123456";

    const user = makeUser({
      email: "giu@gmail.com",
      password: await fakeHash.hash(passwordPlain),
    });

    await inMemoryRepositoriesUser.create(user);

    const result = await sut.execute({
      email: user.email,
      password: passwordPlain, // senha em texto plano
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const token = result.value.accesToken;

 if (result.isRight()) {
    expect(result.value.accesToken).toEqual(expect.any(String));
  }
    }
  });
});
