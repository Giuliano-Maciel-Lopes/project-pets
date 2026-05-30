import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';
import { Role } from '@/domain/account/enterprise/entities/users';
import { hash } from 'bcryptjs';
import request from 'supertest';

describe('ControllerFindUserById (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);

    await app.init();

    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/:id — deve retornar o usuário', async () => {
    const user = await userFactory.makePrismaUser({ email: `findid-${randomUUID()}@test.com` });

    const res = await adminAgent.get(`/users/${user.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(user.id.toString());
  });

  it('GET /users/:id — deve retornar 404 se não existir', async () => {
    const res = await adminAgent.get(`/users/${randomUUID()}`);

    expect(res.statusCode).toBe(404);
  });

  it('GET /users/:id — resposta não deve conter senha', async () => {
    const user = await userFactory.makePrismaUser({ email: `safe-${randomUUID()}@test.com` });

    const res = await adminAgent.get(`/users/${user.id}`);

    expect(res.body.user).not.toHaveProperty('password');
  });

  it('GET /users/:id — ADOPTER pode buscar o próprio id', async () => {
    const password = 'test-password-123';
    const email = `self-adopter-${randomUUID()}@test.com`;
    const adopterUser = await userFactory.makePrismaUser({
      email,
      password: await hash(password, 8),
      role: Role.ADOPTER,
    });

    const adopterAgent = request.agent(app.getHttpServer());
    await adopterAgent.post('/sessions').send({ email, password });

    const res = await adopterAgent.get(`/users/${adopterUser.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(adopterUser.id.toString());
  });

  it('GET /users/:id — ADOPTER recebe 403 ao tentar buscar id de outro usuário', async () => {
    const otherUser = await userFactory.makePrismaUser({ email: `other-${randomUUID()}@test.com` });
    const adopterAgent = await loginAsAdopter(app, userFactory);

    const res = await adopterAgent.get(`/users/${otherUser.id}`);

    expect(res.statusCode).toBe(403);
  });
});
