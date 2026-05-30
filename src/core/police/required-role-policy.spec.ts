import { Role } from '@/domain/account/enterprise/entities/users';
import { RequiredRolePolicy } from './required-role-policy';

describe('RequiredRolePolicy', () => {
  it('passa quando o ator tem a role permitida', () => {
    const policy = new RequiredRolePolicy([Role.ADMIN]);
    const result = policy.validate({ actor: { id: '1', role: Role.ADMIN } });
    expect(result.isRight()).toBe(true);
  });

  it('bloqueia quando o ator não tem a role permitida', () => {
    const policy = new RequiredRolePolicy([Role.ADMIN]);
    const result = policy.validate({ actor: { id: '1', role: Role.ADOPTER } });
    expect(result.isLeft()).toBe(true);
  });

  it('passa quando a role está em uma lista com múltiplas opções', () => {
    const policy = new RequiredRolePolicy([Role.ADMIN, Role.ADOPTER]);
    const result = policy.validate({ actor: { id: '1', role: Role.ADOPTER } });
    expect(result.isRight()).toBe(true);
  });
});
