import { AppModule } from '@/app.module';
import { UserFactory } from '@/test/factories/makeUser';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { DataBaseModule } from '@/infra/database/database.module';

describe('ControllerCreateAccount (e2e)', () => {
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

  it('POST /users — deve criar um usuário', async () => {
    const email = `create-${randomUUID()}@test.com`;

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Giuliano', email, password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Usuário criado com sucesso');
  });

  it('POST /users — deve retornar 409 se email já existe', async () => {
    const email = `dup-${randomUUID()}@test.com`;

    await userFactory.makePrismaUser({ email });

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Outro', email, password: '123456' });

    expect(res.statusCode).toBe(409);
  });

  it('POST /users — resposta não deve conter senha', async () => {
    const email = `safe-${randomUUID()}@test.com`;

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Seguro', email, password: '123456' });

    expect(res.body).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toContain('123456');
  });
});
