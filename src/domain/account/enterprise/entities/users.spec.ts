import { makeUser } from '@/test/factories/makeUser';

describe('User entity', () => {
  it('toSafe não expõe a senha', () => {
    const user = makeUser({ password: 'hash-secreta' });
    const safe = user.toSafe();

    expect(safe).not.toHaveProperty('password');
  });

  it('toSafe retorna os campos públicos corretamente', () => {
    const user = makeUser({ name: 'Giuliano', email: 'g@test.com' });
    const safe = user.toSafe();

    expect(safe.id).toBe(user.id.toString());
    expect(safe.name).toBe('Giuliano');
    expect(safe.email).toBe('g@test.com');
    expect(safe.role).toBe(user.role);
    expect(safe.createdAt).toBeInstanceOf(Date);
  });
});
