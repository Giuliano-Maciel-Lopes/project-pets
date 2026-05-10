import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { PetFactory } from '@/test/factories/makePet';
import { AdoptionFactory } from '@/test/factories/makeAdoption';
import { AdoptionCandidateFactory } from '@/test/factories/makeAdoptionCandidate';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

describe('ControllerFindAdoptionById (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let unitFactory: UnitFactory;
  let petFactory: PetFactory;
  let adoptionFactory: AdoptionFactory;
  let candidateFactory: AdoptionCandidateFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [
        UserFactory,
        UnitFactory,
        PetFactory,
        AdoptionFactory,
        AdoptionCandidateFactory,
      ],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    unitFactory = module.get(UnitFactory);
    petFactory = module.get(PetFactory);
    adoptionFactory = module.get(AdoptionFactory);
    candidateFactory = module.get(AdoptionCandidateFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /adoptions/:id — deve retornar a adoção', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    const pet = await petFactory.makePrismaPet({ unitId: unit.id });
    const adopter = await userFactory.makePrismaUser();
    await candidateFactory.makePrismaAdoptionCandidate({}, adopter.id);

    const adoption = await adoptionFactory.makePrismaAdoption({
      petId: pet.id,
      adopterId: adopter.id,
      unityId: unit.id,
    });

    const res = await adminAgent.get(`/adoptions/${adoption.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.adoption.id).toBe(adoption.id.toString());
    expect(res.body.adoption.status).toBe('PENDING');
  });

  it('GET /adoptions/:id — deve retornar 404 se não existir', async () => {
    const res = await adminAgent.get(`/adoptions/${randomUUID()}`);
    expect(res.statusCode).toBe(404);
  });

  it('GET /adoptions/:id — deve retornar 400 com ID inválido', async () => {
    const res = await adminAgent.get('/adoptions/nao-e-uuid');
    expect(res.statusCode).toBe(400);
  });
});
