import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { loginAsAdmin } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerCreateAdoptionCandidate (e2e)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let adminAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DataBaseModule],
      providers: [UserFactory],
    }).compile();

    app = setupTestApp(module.createNestApplication());
    userFactory = module.get(UserFactory);

    await app.init();
    adminAgent = await loginAsAdmin(app, userFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /adoption-candidates — deve criar um candidato', async () => {
    const res = await adminAgent.post('/adoption-candidates').send({
      name: 'João Silva',
      email: 'joao.silva@test.com',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'https://example.com/identidade.jpg',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.adoptionCandidate.name).toBe('João Silva');
    expect(res.body.adoptionCandidate.cpf).toBe('12345678909');
    expect(res.body.adoptionCandidate.isBanned).toBe(false);
  });

  it('POST /adoption-candidates — deve retornar 400 com CPF inválido', async () => {
    const res = await adminAgent.post('/adoption-candidates').send({
      name: 'João Silva',
      cpf: 'cpf-invalido',
      phone: '11999999999',
      identityUrl: 'https://example.com/identidade.jpg',
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /adoption-candidates — deve retornar 400 com URL inválida', async () => {
    const res = await adminAgent.post('/adoption-candidates').send({
      name: 'João Silva',
      cpf: '123.456.789-09',
      phone: '11999999999',
      identityUrl: 'nao-e-url',
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /adoption-candidates — deve retornar 401 sem autenticação', async () => {
    const res = await request(app.getHttpServer())
      .post('/adoption-candidates')
      .send({
        name: 'João Silva',
        email: 'joao.silva@test.com',
        cpf: '123.456.789-09',
        phone: '11999999999',
        identityUrl: 'https://example.com/identidade.jpg',
      });

    expect(res.statusCode).toBe(401);
  });

  it('POST /adoption-candidates — deve retornar 409 para email duplicado', async () => {
    const payload = {
      name: 'Maria Souza',
      email: 'maria.duplicada@test.com',
      cpf: '529.982.247-25',
      phone: '11988888888',
      identityUrl: 'https://example.com/identidade2.jpg',
    };

    await adminAgent.post('/adoption-candidates').send(payload);

    const res = await adminAgent.post('/adoption-candidates').send(payload);

    expect(res.statusCode).toBe(409);
  });
});
