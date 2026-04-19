import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';

describe('ControllerAuthenticate (e2e)', () => {
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

  it('POST /sessions — deve autenticar e setar cookie httpOnly', async () => {
    const email = `auth-${randomUUID()}@test.com`;
    const password = '123456';

    await userFactory.makePrismaUser({ email, password: await hash(password, 8) });

    const res = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email, password });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Autenticado com sucesso');

    const cookie = res.headers['set-cookie'] as string[];
    expect(cookie).toBeDefined();
    expect(cookie[0]).toContain('access_token');
    expect(cookie[0]).toContain('HttpOnly');
  });

  it('POST /sessions — deve retornar 401 com credenciais erradas', async () => {
    const email = `auth-${randomUUID()}@test.com`;

    await userFactory.makePrismaUser({ email, password: await hash('123456', 8) });

    const res = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email, password: 'senha-errada' });

    expect(res.statusCode).toBe(401);
  });

  it('POST /sessions — resposta não deve conter senha', async () => {
    const email = `auth-${randomUUID()}@test.com`;
    const password = '123456';

    await userFactory.makePrismaUser({ email, password: await hash(password, 8) });

    const res = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email, password });

    expect(res.body).not.toHaveProperty('password');
  });
});
