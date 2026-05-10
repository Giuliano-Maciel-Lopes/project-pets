import { AppModule } from '@/app.module';
import { DataBaseModule } from '@/infra/database/database.module';
import { UserFactory } from '@/test/factories/makeUser';
import { loginAsAdmin, loginAsAdopter } from '@/test/utils/login-and-get-cookie';
import { setupTestApp } from '@/test/utils/setup-test-app';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('ControllerUploadAttachment (e2e)', () => {
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

  it('POST /attachments — deve fazer upload de uma imagem', async () => {
    const fakeImage = Buffer.from('fake-image-content');

    const res = await adminAgent
      .post('/attachments')
      .attach('file', fakeImage, { filename: 'foto.jpg', contentType: 'image/jpeg' });

    expect(res.statusCode).toBe(201);
    expect(res.body.attachment).toHaveProperty('id');
    expect(res.body.attachment).toHaveProperty('title');
    expect(res.body.attachment).toHaveProperty('link');
  });

  it('POST /attachments — deve retornar 400 sem arquivo', async () => {
    const res = await adminAgent.post('/attachments');

    expect(res.statusCode).toBe(400);
  });

  it('POST /attachments — deve retornar 400 com tipo de arquivo inválido', async () => {
    const fakePdf = Buffer.from('%PDF-fake');

    const res = await adminAgent
      .post('/attachments')
      .attach('file', fakePdf, { filename: 'documento.pdf', contentType: 'application/pdf' });

    expect(res.statusCode).toBe(400);
  });

  it('POST /attachments — deve funcionar para ADOPTER autenticado', async () => {
    const adopterAgent = await loginAsAdopter(app, userFactory);
    const fakeImage = Buffer.from('fake-image-content');

    const res = await adopterAgent
      .post('/attachments')
      .attach('file', fakeImage, { filename: 'foto.png', contentType: 'image/png' });

    expect(res.statusCode).toBe(201);
  });
});
