import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { AdoptionCandidateFactory } from '@/test/factories/makeAdoptionCandidate';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerListAdoptionCandidates (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let candidateFactory: AdoptionCandidateFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory, AdoptionCandidateFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);
    candidateFactory = module.get(AdoptionCandidateFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /adoption-candidates — deve listar candidatos com paginação', async () => {
    await candidateFactory.makePrismaAdoptionCandidate({ name: 'Candidato Lista A' });
    await candidateFactory.makePrismaAdoptionCandidate({ name: 'Candidato Lista B' });

    const res = await adminAgent.get('/adoption-candidates').query({ page: 1, limit: 25 });

    expect(res.statusCode).toBe(200);
    expect(res.body.candidates).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(25);
  });

  it('GET /adoption-candidates — deve filtrar por nome', async () => {
    await candidateFactory.makePrismaAdoptionCandidate({ name: 'Candidato Filtro Nome' });

    const res = await adminAgent
      .get('/adoption-candidates')
      .query({ name: 'Filtro Nome' });

    expect(res.statusCode).toBe(200);
    expect(res.body.candidates.length).toBeGreaterThanOrEqual(1);
    expect(
      res.body.candidates.every((c: any) =>
        c.name.toLowerCase().includes('filtro nome'),
      ),
    ).toBe(true);
  });

  it('GET /adoption-candidates — deve filtrar por isBanned=true', async () => {
    await candidateFactory.makePrismaAdoptionCandidate({
      isBanned: true,
      bannedReason: 'Teste banido',
    });

    const res = await adminAgent
      .get('/adoption-candidates')
      .query({ isBanned: 'true' });

    expect(res.statusCode).toBe(200);
    expect(res.body.candidates.every((c: any) => c.isBanned === true)).toBe(true);
  });

  it('GET /adoption-candidates — deve filtrar por isBanned=false', async () => {
    await candidateFactory.makePrismaAdoptionCandidate({ isBanned: false });

    const res = await adminAgent
      .get('/adoption-candidates')
      .query({ isBanned: 'false' });

    expect(res.statusCode).toBe(200);
    expect(res.body.candidates.every((c: any) => c.isBanned === false)).toBe(true);
  });

  it('GET /adoption-candidates — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const res = await adopterAgent.get('/adoption-candidates');
    expect(res.statusCode).toBe(403);
  });
});
