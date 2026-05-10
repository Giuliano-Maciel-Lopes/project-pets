import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { PetFactory } from '@/test/factories/makePet';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

describe('ControllerFindPetById (e2e)', () => {
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

  it('GET /pets/:id — deve retornar o pet com attachments', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    const pet = await petFactory.makePrismaPet({ unitId: unit.id });

    const res = await adminAgent.get(`/pets/${pet.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.pet.id).toBe(pet.id.toString());
    expect(res.body.pet.attachments).toBeInstanceOf(Array);
  });

  it('GET /pets/:id — deve retornar 404 se não existir', async () => {
    const res = await adminAgent.get(`/pets/${randomUUID()}`);

    expect(res.statusCode).toBe(404);
  });

  it('GET /pets/:id — deve retornar 400 com ID inválido', async () => {
    const res = await adminAgent.get('/pets/nao-e-uuid');

    expect(res.statusCode).toBe(400);
  });
});
