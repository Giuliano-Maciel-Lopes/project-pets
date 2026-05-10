import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { UnitFactory } from '@/test/factories/makeUnit';
import { PetFactory } from '@/test/factories/makePet';
import { AdoptionCandidateFactory } from '@/test/factories/makeAdoptionCandidate';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerCreateAdoption (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let unitFactory: UnitFactory;
  let petFactory: PetFactory;
  let candidateFactory: AdoptionCandidateFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory, UnitFactory, PetFactory, AdoptionCandidateFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    unitFactory = module.get(UnitFactory);
    petFactory = module.get(PetFactory);
    candidateFactory = module.get(AdoptionCandidateFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /adoptions — deve criar uma adoção', async () => {
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    const pet = await petFactory.makePrismaPet({ unitId: unit.id });

    // O adopter precisa existir como User (FK) e como AdoptionCandidate (domínio usa findById)
    const adopter = await userFactory.makePrismaUser();
    await candidateFactory.makePrismaAdoptionCandidate({}, adopter.id);

    const res = await adminAgent.post('/adoptions').send({
      petId: pet.id.toString(),
      adopterId: adopter.id.toString(),
      unityId: unit.id.toString(),
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.adoption.status).toBe('PENDING');
    expect(res.body.adoption.petId).toBe(pet.id.toString());
  });

  it('POST /adoptions — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const manager = await userFactory.makePrismaUser();
    const unit = await unitFactory.makePrismaUnit({ managerId: manager.id });
    const pet = await petFactory.makePrismaPet({ unitId: unit.id });
    const adopter = await userFactory.makePrismaUser();

    const res = await adopterAgent.post('/adoptions').send({
      petId: pet.id.toString(),
      adopterId: adopter.id.toString(),
      unityId: unit.id.toString(),
    });

    expect(res.statusCode).toBe(403);
  });

  it('POST /adoptions — deve retornar 400 com dados inválidos', async () => {
    const res = await adminAgent.post('/adoptions').send({
      petId: 'nao-e-uuid',
      adopterId: 'nao-e-uuid',
      unityId: 'nao-e-uuid',
    });

    expect(res.statusCode).toBe(400);
  });
});
