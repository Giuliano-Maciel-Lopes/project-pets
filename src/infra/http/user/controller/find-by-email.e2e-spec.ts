import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';

describe('ControllerFindUserByEmail (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory],
    }).compile();

    app = module.createNestApplication();
    userFactory = module.get(UserFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/email/:email — deve retornar o usuário', async () => {
    const email = `findbyemail-${randomUUID()}@test.com`;
    await userFactory.makePrismaUser({ email });

    const res = await request(app.getHttpServer()).get(`/users/email/${email}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it('GET /users/email/:email — deve retornar 404 se não existir', async () => {
    const res = await request(app.getHttpServer()).get(
      `/users/email/naoexiste-${randomUUID()}@test.com`,
    );

    expect(res.statusCode).toBe(404);
  });

  it('GET /users/email/:email — resposta não deve conter senha', async () => {
    const email = `safe-${randomUUID()}@test.com`;
    await userFactory.makePrismaUser({ email });

    const res = await request(app.getHttpServer()).get(`/users/email/${email}`);

    expect(res.body.user).not.toHaveProperty('password');
  });
});
