import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

describe('ControllerUpdateUnit (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let unitFactory: UnitFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory, UnitFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    unitFactory = module.get(UnitFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('PUT /units/:id — deve atualizar a unidade', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adminAgent.put(`/units/${unit.id}`).send({
      name: 'Nome Atualizado',
      address: 'Rua Nova, 200',
      city: 'Curitiba',
      state: 'PR',
      managerId: manager.id.toString(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Unidade atualizada com sucesso');
  });

  it('PUT /units/:id — deve retornar 404 se não existir', async () => {
    const manager = await userFactory.makePrismaUser();

    const res = await adminAgent.put(`/units/${randomUUID()}`).send({
      name: 'Nome',
      address: 'Rua X, 1',
      city: 'SP',
      state: 'SP',
      managerId: manager.id.toString(),
    });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /units/:id — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adopterAgent.put(`/units/${unit.id}`).send({
      name: 'Nome',
      address: 'Rua X, 1',
      city: 'SP',
      state: 'SP',
      managerId: manager.id.toString(),
    });

    expect(res.statusCode).toBe(403);
  });
});
