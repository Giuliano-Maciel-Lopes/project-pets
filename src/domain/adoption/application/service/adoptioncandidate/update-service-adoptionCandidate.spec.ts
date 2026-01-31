import { InMemoryRepositoriesAdoptionCandidate } from '@/test/repositories/in-memory-adoptionCandidate';
import { ServiceUpdateAdoptionCandidate } from './update-service-adoptionCandidate';
import { makeAdoptionCandidate } from '@/test/factories/makeAdoptionCandidate';

let inMemoryRepositoriesAdoptionCandidate: InMemoryRepositoriesAdoptionCandidate;
let sut: ServiceUpdateAdoptionCandidate;

describe('AdoptionCandidate Service', () => {
  beforeEach(() => {
    inMemoryRepositoriesAdoptionCandidate =
      new InMemoryRepositoriesAdoptionCandidate();
    sut = new ServiceUpdateAdoptionCandidate(
      inMemoryRepositoriesAdoptionCandidate,
    );
  });

  it('deve atualizar um candidate corretamente', async () => {
    const adoptionCandidate = makeAdoptionCandidate({
      name: 'Giuliano',
      phone: '11999999999',
      identityUrl: 'http://url-inicial.com', // mudar jaja para atchemnts
    });
    await inMemoryRepositoriesAdoptionCandidate.create(adoptionCandidate);

    const result = await sut.execute({
      id: adoptionCandidate.id.toString(),
      name: 'Giuliano Atualizado',
      phone: '11988888888',
      identityUrl: 'http://url-atualizada.com',
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const updatedCandidate = result.value.adoptionCandidate;

      expect(updatedCandidate.id).toBeTruthy();
      expect(inMemoryRepositoriesAdoptionCandidate.items[0]).toEqual(
        updatedCandidate,
      );
      expect(updatedCandidate.cpf.value).toBe('12345678909'); // mantém CPF
      expect(updatedCandidate.name).toBe('Giuliano Atualizado');
      expect(updatedCandidate.phone).toBe('11988888888');
      expect(updatedCandidate.identityUrl).toBe('http://url-atualizada.com');
    }
  });
});
