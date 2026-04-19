import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';

describe('ControllerFindUserById (e2e)', () => {
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

  it('GET /users/:id — deve retornar o usuário', async () => {
    const email = `findid-${randomUUID()}@test.com`;
    const user = await userFactory.makePrismaUser({ email });

    const res = await request(app.getHttpServer()).get(`/users/${user.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(user.id.toString());
  });

  it('GET /users/:id — deve retornar 404 se não existir', async () => {
    const res = await request(app.getHttpServer()).get(`/users/${randomUUID()}`);

    expect(res.statusCode).toBe(404);
  });


  it('GET /users/:id — resposta não deve conter senha', async () => {
    const email = `safe-${randomUUID()}@test.com`;
    const user = await userFactory.makePrismaUser({ email });

    const res = await request(app.getHttpServer()).get(`/users/${user.id}`);

    expect(res.body.user).not.toHaveProperty('password');
  });
});
