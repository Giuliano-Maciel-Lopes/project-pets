import {
  RepositoriesAdoptionCandidate,
  ListAdoptionCandidateFilters,
  PaginatedAdoptionCandidates,
} from '@/domain/adoption/application/repositories/adoptioncandidate';
import { AdoptionCandidate } from '@/domain/adoption/enterprise/entities/adoptionCandidate';

export class InMemoryRepositoriesAdoptionCandidate implements RepositoriesAdoptionCandidate {
  public items: AdoptionCandidate[] = [];

  async findBy({
    id,
    email,
    cpf,
  }: {
    id?: string;
    email?: string;
    cpf?: string;
  }): Promise<AdoptionCandidate | null> {
    return (
      this.items.find((c) => {
        if (id && c.id.toString() === id) return true;
        if (email && c.email === email) return true;
        if (cpf && c.cpf.value === cpf.replace(/\D/g, '')) return true;
        return false;
      }) ?? null
    );
  }

  async create(candidate: AdoptionCandidate): Promise<void> {
    this.items.push(candidate);
  }

  async update(candidateToUpdate: AdoptionCandidate): Promise<void> {
    const index = this.items.findIndex(
      (c) => c.id.toString() === candidateToUpdate.id.toString(),
    );
    if (index >= 0) {
      this.items[index] = candidateToUpdate;
    }
  }

  async setBlock(candidate: AdoptionCandidate): Promise<void> {
    const index = this.items.findIndex(
      (c) => c.id.toString() === candidate.id.toString(),
    );
    if (index >= 0) this.items[index] = candidate;
  }

  async linkUser(candidate: AdoptionCandidate): Promise<void> {
    const index = this.items.findIndex(
      (c) => c.id.toString() === candidate.id.toString(),
    );
    if (index >= 0) this.items[index] = candidate;
  }

  async list({
    userId,
    name,
    cpf,
    isBanned,
    page,
    limit,
  }: ListAdoptionCandidateFilters): Promise<PaginatedAdoptionCandidates> {
    let filtered = this.items;

    if (userId) filtered = filtered.filter((c) => c.userId?.toString() === userId);
    if (name) filtered = filtered.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    if (cpf) filtered = filtered.filter((c) => c.cpf.value.includes(cpf.replace(/\D/g, '')));
    if (isBanned !== undefined) filtered = filtered.filter((c) => c.isBanned === isBanned);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const candidates = filtered.slice(skip, skip + limit);

    return { candidates, total, page, limit };
  }
}
