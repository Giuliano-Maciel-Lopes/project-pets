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

describe('ControllerUpdateAdoptionCandidate (e2e)', () => {
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

  it('PUT /adoption-candidates/:id — deve atualizar o candidato', async () => {
    const candidate = await candidateFactory.makePrismaAdoptionCandidate();

    const res = await adminAgent.put(`/adoption-candidates/${candidate.id}`).send({
      name: 'Nome Atualizado',
      phone: '11888888888',
      identityUrl: 'https://example.com/nova-identidade.jpg',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.adoptionCandidate.name).toBe('Nome Atualizado');
    expect(res.body.adoptionCandidate.phone).toBe('11888888888');
  });

  it('PUT /adoption-candidates/:id — deve retornar 404 se não existir', async () => {
    const res = await adminAgent.put(`/adoption-candidates/${randomUUID()}`).send({
      name: 'Nome',
      phone: '11888888888',
      identityUrl: 'https://example.com/identidade.jpg',
    });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /adoption-candidates/:id — deve retornar 403 para ADOPTER', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const candidate = await candidateFactory.makePrismaAdoptionCandidate();

    const res = await adopterAgent.put(`/adoption-candidates/${candidate.id}`).send({
      name: 'Nome',
      phone: '11888888888',
      identityUrl: 'https://example.com/identidade.jpg',
    });

    expect(res.statusCode).toBe(403);
  });
});
