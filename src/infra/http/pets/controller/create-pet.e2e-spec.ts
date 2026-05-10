import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerCreatePet (e2e)', () => {
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

  it('POST /pets — deve criar um pet', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adminAgent.post('/pets').send({
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Labrador',
      age: 3,
      sex: 'male',
      unitId: unit.id.toString(),
      attachmentIds: [],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.pet.name).toBe('Rex');
    expect(res.body.pet.status).toBe('available');
    expect(res.body.pet.attachments).toBeInstanceOf(Array);
  });

  it('POST /pets — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });

    const res = await adopterAgent.post('/pets').send({
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Labrador',
      unitId: unit.id.toString(),
      attachmentIds: [],
    });

    expect(res.statusCode).toBe(403);
  });

  it('POST /pets — deve retornar 400 com dados inválidos', async () => {
    const res = await adminAgent.post('/pets').send({
      name: 'R',
      species: '',
      breed: '',
      unitId: 'nao-e-uuid',
    });

    expect(res.statusCode).toBe(400);
  });
});
