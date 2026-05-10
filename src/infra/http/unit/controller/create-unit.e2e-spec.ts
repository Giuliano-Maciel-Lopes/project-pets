import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerCreateUnit (e2e)', () => {
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

  it('POST /units — deve criar uma unidade', async () => {
    const manager = await userFactory.makePrismaUser();

    const res = await adminAgent.post('/units').send({
      name: 'Unidade Centro',
      address: 'Rua das Flores, 100',
      city: 'São Paulo',
      state: 'SP',
      managerId: manager.id.toString(),
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.unit.name).toBe('Unidade Centro');
    expect(res.body.unit.slug).toBe('unidade-centro');
  });

  it('POST /units — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();

    const res = await adopterAgent.post('/units').send({
      name: 'Unidade X',
      address: 'Rua Y, 1',
      city: 'SP',
      state: 'SP',
      managerId: manager.id.toString(),
    });

    expect(res.statusCode).toBe(403);
  });

  it('POST /units — deve retornar 400 com dados inválidos', async () => {
    const res = await adminAgent.post('/units').send({
      name: 'U',
      address: '',
      city: '',
      state: 'INVALIDO',
      managerId: 'nao-e-uuid',
    });

    expect(res.statusCode).toBe(400);
  });
});
