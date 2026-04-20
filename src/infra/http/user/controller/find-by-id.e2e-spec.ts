import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';
import request from 'supertest';

describe('ControllerFindUserById (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);

    await app.init();

    agent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/:id — deve retornar o usuário', async () => {
    const user = await userFactory.makePrismaUser({ email: `findid-${randomUUID()}@test.com` });

    const res = await agent.get(`/users/${user.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(user.id.toString());
  });

  it('GET /users/:id — deve retornar 404 se não existir', async () => {
    const res = await agent.get(`/users/${randomUUID()}`);

    expect(res.statusCode).toBe(404);
  });

  it('GET /users/:id — resposta não deve conter senha', async () => {
    const user = await userFactory.makePrismaUser({ email: `safe-${randomUUID()}@test.com` });

    const res = await agent.get(`/users/${user.id}`);

    expect(res.body.user).not.toHaveProperty('password');
  });
});
