import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { AdoptionCandidateFactory } from '@/test/factories/makeAdoptionCandidate';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

describe('ControllerBanAdoptionCandidate (e2e)', () => {
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

  it('PATCH /adoption-candidates/:id/ban — deve banir um candidato', async () => {
    const candidate = await candidateFactory.makePrismaAdoptionCandidate();

    const res = await adminAgent
      .patch(`/adoption-candidates/${candidate.id}/ban`)
      .send({ isBanned: true, bannedReason: 'Maus-tratos ao animal' });

    expect(res.statusCode).toBe(200);
    expect(res.body.adoptionCandidate.isBanned).toBe(true);
    expect(res.body.adoptionCandidate.bannedReason).toBe('Maus-tratos ao animal');
  });

  it('PATCH /adoption-candidates/:id/ban — deve desbanir um candidato', async () => {
    const candidate = await candidateFactory.makePrismaAdoptionCandidate({
      isBanned: true,
      bannedReason: 'Motivo antigo',
    });

    const res = await adminAgent
      .patch(`/adoption-candidates/${candidate.id}/ban`)
      .send({ isBanned: false, bannedReason: 'Revisão aprovada' });

    expect(res.statusCode).toBe(200);
    expect(res.body.adoptionCandidate.isBanned).toBe(false);
  });

  it('PATCH /adoption-candidates/:id/ban — deve retornar 404 se não existir', async () => {
    const res = await adminAgent
      .patch(`/adoption-candidates/${randomUUID()}/ban`)
      .send({ isBanned: true, bannedReason: 'Motivo qualquer' });

    expect(res.statusCode).toBe(404);
  });

  it('PATCH /adoption-candidates/:id/ban — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const candidate = await candidateFactory.makePrismaAdoptionCandidate();

    const res = await adopterAgent
      .patch(`/adoption-candidates/${candidate.id}/ban`)
      .send({ isBanned: true, bannedReason: 'Não deveria funcionar' });

    expect(res.statusCode).toBe(403);
  });

  it('PATCH /adoption-candidates/:id/ban — deve retornar 400 sem motivo', async () => {
    const candidate = await candidateFactory.makePrismaAdoptionCandidate();

    const res = await adminAgent
      .patch(`/adoption-candidates/${candidate.id}/ban`)
      .send({ isBanned: true });

    expect(res.statusCode).toBe(400);
  });
});
