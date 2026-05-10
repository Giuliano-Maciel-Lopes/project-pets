import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { PetFactory } from '@/test/factories/makePet';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { PetStatus } from '@/domain/pets/enterprise/entity/pets';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerListPets (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let unitFactory: UnitFactory;
  let petFactory: PetFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory, UnitFactory, PetFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    unitFactory = module.get(UnitFactory);
    petFactory = module.get(PetFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /pets — deve listar pets com paginação', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    await petFactory.makePrismaPet({ unitId: unit.id, name: 'Pet A' });
    await petFactory.makePrismaPet({ unitId: unit.id, name: 'Pet B' });

    const res = await adminAgent.get('/pets').query({ page: 1, limit: 25 });

    expect(res.statusCode).toBe(200);
    expect(res.body.pets).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(25);
  });

  it('GET /pets — deve filtrar por espécie', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    await petFactory.makePrismaPet({ unitId: unit.id, species: 'Gato' });

    const res = await adminAgent.get('/pets').query({ species: 'Gato' });

    expect(res.statusCode).toBe(200);
    expect(res.body.pets.every((p: any) => p.species === 'Gato')).toBe(true);
  });

  it('GET /pets — deve filtrar por status', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    await petFactory.makePrismaPet({ unitId: unit.id, status: PetStatus.UNAVAILABLE });

    const res = await adminAgent.get('/pets').query({ status: 'unavailable' });

    expect(res.statusCode).toBe(200);
    expect(res.body.pets.every((p: any) => p.status === 'unavailable')).toBe(true);
  });

  it('GET /pets — deve filtrar por unitId', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    await petFactory.makePrismaPet({ unitId: unit.id });

    const res = await adminAgent.get('/pets').query({ unitId: unit.id.toString() });

    expect(res.statusCode).toBe(200);
    expect(res.body.pets.every((p: any) => p.unitId === unit.id.toString())).toBe(true);
  });
});
