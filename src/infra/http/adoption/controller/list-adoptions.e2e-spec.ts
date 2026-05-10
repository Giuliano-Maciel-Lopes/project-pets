import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { PetFactory } from '@/test/factories/makePet';
import { AdoptionFactory } from '@/test/factories/makeAdoption';
import { AdoptionCandidateFactory } from '@/test/factories/makeAdoptionCandidate';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerListAdoptions (e2e)', () => {
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

  it('GET /adoptions — deve listar adoções', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    const pet = await petFactory.makePrismaPet({ unitId: unit.id });
    const adopter = await userFactory.makePrismaUser();
    await candidateFactory.makePrismaAdoptionCandidate({}, adopter.id);

    await adoptionFactory.makePrismaAdoption({
      petId: pet.id,
      adopterId: adopter.id,
      unityId: unit.id,
    });

    const res = await adminAgent.get('/adoptions');

    expect(res.statusCode).toBe(200);
    expect(res.body.adoptions).toBeInstanceOf(Array);
    expect(res.body.adoptions.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /adoptions — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const res = await adopterAgent.get('/adoptions');
    expect(res.statusCode).toBe(403);
  });
});
