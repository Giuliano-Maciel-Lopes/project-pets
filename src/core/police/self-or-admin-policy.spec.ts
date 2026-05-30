import { Role } from '@/domain/account/enterprise/entities/users';
import { SelfOrAdminPolicy } from './self-or-admin-policy';

const OWNER_ID = 'user-owner-123';

const adminActor = { id: 'admin-456', role: Role.ADMIN };
const ownerActor = { id: OWNER_ID, role: Role.ADOPTER };
const strangerActor = { id: 'stranger-789', role: Role.ADOPTER };

describe('SelfOrAdminPolicy', () => {
  let policy: SelfOrAdminPolicy;

  beforeEach(() => {
    policy = new SelfOrAdminPolicy();
  });

  it('passa quando o ator é ADMIN acessando recurso de outro usuário', () => {
    const result = policy.validate({ actor: adminActor, resourceOwnerId: OWNER_ID });
    expect(result.isRight()).toBe(true);
  });

  it('passa quando o ADOPTER acessa o próprio recurso', () => {
    const result = policy.validate({ actor: ownerActor, resourceOwnerId: OWNER_ID });
    expect(result.isRight()).toBe(true);
  });

  it('bloqueia quando o ADOPTER tenta acessar recurso de outro usuário', () => {
    const result = policy.validate({ actor: strangerActor, resourceOwnerId: OWNER_ID });
    expect(result.isLeft()).toBe(true);
    expect(result.value?.message).toBeTruthy();
  });

  it('bloqueia com segurança quando o contexto não tem actor', () => {
    const result = policy.validate({ actor: null as never, resourceOwnerId: OWNER_ID });
    expect(result.isLeft()).toBe(true);
  });
});
