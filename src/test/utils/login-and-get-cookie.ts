import { INestApplication } from '@nestjs/common';
import { Role } from '@/domain/account/enterprise/entities/users';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { UserFactory } from '../factories/makeUser';

async function loginAs(
  app: INestApplication,
  userFactory: UserFactory,
  role: Role,
): Promise<ReturnType<typeof request.agent>> {
  const password = 'test-password-123';
  const email = `helper-${role}-${Date.now()}@test.com`;

  await userFactory.makePrismaUser({ email, password: await hash(password, 8), role });

  const agent = request.agent(app.getHttpServer());

  const res = await agent.post('/sessions').send({ email, password });

  if (res.status !== 201) {
    throw new Error(`Login falhou com status ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return agent;
}

export function loginAsAdopter(app: INestApplication, userFactory: UserFactory) {
  return loginAs(app, userFactory, Role.ADOPTER);
}

export function loginAsAdmin(app: INestApplication, userFactory: UserFactory) {
  return loginAs(app, userFactory, Role.ADMIN);
}
