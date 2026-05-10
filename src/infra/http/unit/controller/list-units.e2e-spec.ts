import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerListUnits (e2e)', () => {
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

  it('GET /units — deve listar unidades com paginação', async () => {
    const manager = await userFactory.makePrismaUser();
    await unitFactory.makePrismaUnit({ managerId: manager.id, name: 'Unidade Lista A' });
    await unitFactory.makePrismaUnit({ managerId: manager.id, name: 'Unidade Lista B' });

    const res = await adminAgent.get('/units').query({ page: 1, limit: 25 });

    expect(res.statusCode).toBe(200);
    expect(res.body.units).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(25);
  });

  it('GET /units — deve filtrar por cidade', async () => {
    const manager = await userFactory.makePrismaUser();
    await unitFactory.makePrismaUnit({ managerId: manager.id, city: 'Curitiba', name: 'Unidade Curitiba X' });

    const res = await adminAgent.get('/units').query({ city: 'Curitiba' });

    expect(res.statusCode).toBe(200);
    expect(res.body.units.every((u: any) => u.city === 'Curitiba')).toBe(true);
  });

  it('GET /units — deve filtrar por isActive', async () => {
    const manager = await userFactory.makePrismaUser();
    await unitFactory.makePrismaUnit({ managerId: manager.id, isActive: false, name: 'Inativa Y' });

    const res = await adminAgent.get('/units').query({ isActive: 'false' });

    expect(res.statusCode).toBe(200);
    expect(res.body.units.every((u: any) => u.isActive === false)).toBe(true);
  });
});
