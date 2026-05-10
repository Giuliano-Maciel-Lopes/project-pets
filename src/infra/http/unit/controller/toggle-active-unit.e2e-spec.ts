import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerToggleActiveUnit (e2e)', () => {
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

  it('PATCH /units/:id/active — deve desativar a unidade', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adminAgent
      .patch(`/units/${unit.id}/active`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Status da unidade atualizado com sucesso');
  });

  it('PATCH /units/:id/active — deve reativar a unidade', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id, isActive: false });

    const res = await adminAgent
      .patch(`/units/${unit.id}/active`)
      .send({ isActive: true });

    expect(res.statusCode).toBe(200);
  });

  it('PATCH /units/:id/active — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adopterAgent
      .patch(`/units/${unit.id}/active`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(403);
  });
});
