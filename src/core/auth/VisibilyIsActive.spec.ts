import { UserRole } from './userRole';
import { makePet } from '@/test/factories/makePet';
import { VisibilityPolicy } from './VisibilyIsActive';

// SO DE BASE N VAMOS USAR NO DDD

describe('VisibilityPolicy - usando array e find', () => {
  const pets = [makePet({ isActive: true }), makePet({ isActive: false })];

  it('deve permitir que o ADMIN veja pets inativos', () => {
    const adminCanSee = pets.filter((pet) =>
      VisibilityPolicy.canView(pet.isActive, UserRole.ADMIN),
    );
    expect(adminCanSee.length).toBe(2); // Admin vê todos
  });

  it('deve permitir que o ADOPTER veja apenas pets ativos', () => {
    const adopterCanSee = pets.filter((pet) =>
      VisibilityPolicy.canView(pet.isActive, UserRole.ADOPTER),
    );
    expect(adopterCanSee.length).toBe(1);
    expect(adopterCanSee[0].isActive).toBe(true);
  });

  it('deve simular um findById respeitando a VisibilityPolicy', () => {
    const petIdToFind = pets[1].id.toString(); // pet inativo
    const foundPet = pets.find(
      (pet) =>
        pet.id.toString() === petIdToFind &&
        VisibilityPolicy.canView(pet.isActive, UserRole.ADOPTER),
    );
    expect(foundPet).toBeUndefined(); // ADOPTER não vê pet inativo

    const foundByAdmin = pets.find(
      (pet) =>
        pet.id.toString() === petIdToFind &&
        VisibilityPolicy.canView(pet.isActive, UserRole.ADMIN),
    );
    expect(foundByAdmin).toBeDefined(); // ADMIN vê pet inativo
  });
});
