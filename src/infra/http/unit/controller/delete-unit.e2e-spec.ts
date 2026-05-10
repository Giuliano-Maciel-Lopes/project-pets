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

describe('ControllerDeleteUnit (e2e)', () => {
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

  it('DELETE /units/:id — deve deletar a unidade', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adminAgent.delete(`/units/${unit.id}`);

    expect(res.statusCode).toBe(204);
  });

  it('DELETE /units/:id — deve retornar 404 se não existir', async () => {
    const res = await adminAgent.delete(`/units/${randomUUID()}`);

    expect(res.statusCode).toBe(404);
  });

  it('DELETE /units/:id — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adopterAgent.delete(`/units/${unit.id}`);

    expect(res.statusCode).toBe(403);
  });
});
