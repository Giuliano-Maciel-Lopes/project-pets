import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { ServiceCreatePets } from './create-service-pets';
import { PetSex } from '../../enterprise/entity/pets';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ServicePetAttachments } from './attachements-service-pets';
import { InMemoryRepositoriesPetsAttachements } from '@/test/repositories/in-memory-pets-Attachement';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let servicePetAttachments: ServicePetAttachments;
let sut: ServiceCreatePets;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceCreatePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets();
    inMemoryRepositoriesPetsAttachements = new InMemoryRepositoriesPetsAttachements();
    servicePetAttachments = new ServicePetAttachments(inMemoryRepositoriesPetsAttachements);
    sut = new ServiceCreatePets(inMemoryRepositoriesPets, servicePetAttachments);
  });

  it('admin cria um pet corretamente', async () => {
    const result = await sut.execute({
      actor: adminActor,
      name: 'Boby',
      species: 'Dog',
      unitId: 'unit-123',
      breed: 'Vira-lata',
      age: 3,
      sex: PetSex.MALE,
      attachmentIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.pet.id).toBeTruthy();
      expect(inMemoryRepositoriesPets.items[0]).toEqual(result.value.pet);
      expect(inMemoryRepositoriesPets.items[0].attachment.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
      ]);
    }
  });

  it('adopter não pode criar pet', async () => {
    const result = await sut.execute({
      actor: adopterActor,
      name: 'Boby',
      species: 'Dog',
      unitId: 'unit-123',
      breed: 'Vira-lata',
      attachmentIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });
});
