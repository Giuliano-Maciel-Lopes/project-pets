import { ServiceUpdatePets } from './update-service-pets';
import { InMemoryRepositoriesPets } from '@/test/repositories/in-memory-pets';
import { makePet } from '@/test/factories/makePet';
import { PetSex } from '../../enterprise/entity/pets';
import { ServicePetAttachments } from './attachements-service-pets';
import { InMemoryRepositoriesPetsAttachements } from '@/test/repositories/in-memory-pets-Attachement';
import { makePetAttachment } from '@/test/factories/makePetAttachemnts';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/account/enterprise/entities/users';
import { UnauthorizedError } from '@/core/erros/erro/unauthorized-error';

let inMemoryRepositoriesPets: InMemoryRepositoriesPets;
let inMemoryRepositoriesPetsAttachements: InMemoryRepositoriesPetsAttachements;
let servicePetAttachments: ServicePetAttachments;
let sut: ServiceUpdatePets;

const adminActor = { id: 'admin-id', role: Role.ADMIN };
const adopterActor = { id: 'adopter-id', role: Role.ADOPTER };

describe('ServiceUpdatePets', () => {
  beforeEach(() => {
    inMemoryRepositoriesPetsAttachements = new InMemoryRepositoriesPetsAttachements();
    inMemoryRepositoriesPets = new InMemoryRepositoriesPets(inMemoryRepositoriesPetsAttachements);
    servicePetAttachments = new ServicePetAttachments(inMemoryRepositoriesPetsAttachements);
    sut = new ServiceUpdatePets(inMemoryRepositoriesPets, servicePetAttachments);
  });

  it('admin atualiza um pet corretamente', async () => {
    const pet = makePet({ name: 'cacau', age: 2 });
    await inMemoryRepositoriesPets.create(pet);

    inMemoryRepositoriesPetsAttachements.items.push(
      makePetAttachment({ petId: pet.id, attachmentId: new UniqueEntityId('1') }),
      makePetAttachment({ petId: pet.id, attachmentId: new UniqueEntityId('2') }),
    );

    const result = await sut.execute({
      actor: adminActor,
      id: pet.id.toString(),
      name: 'new name',
      species: 'new specie',
      unitId: 'new unit',
      breed: 'new breed',
      age: 3,
      sex: PetSex.MALE,
      attachmentIds: ['4', '5', '1'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.pet.name).toBe('new name');
      expect(result.value.pet.attachment.currentItems).toHaveLength(3);
    }
  });

  it('adopter não pode atualizar pet', async () => {
    const pet = makePet();
    await inMemoryRepositoriesPets.create(pet);

    const result = await sut.execute({
      actor: adopterActor,
      id: pet.id.toString(),
      name: 'tentativa',
      species: 'dog',
      unitId: 'unit-1',
      breed: 'srd',
      attachmentIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('retorna NotFoundError quando pet não existe', async () => {
    const result = await sut.execute({
      actor: adminActor,
      id: 'id-inexistente',
      name: 'nome',
      species: 'dog',
      unitId: 'unit-1',
      breed: 'srd',
      attachmentIds: [],
    });

    expect(result.isLeft()).toBe(true);
  });
});
