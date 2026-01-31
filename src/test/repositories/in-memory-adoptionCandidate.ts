import { RepositoriesAdoptionCandidate } from "@/domain/adoption/application/repositories/adoptioncandidate";
import { AdoptionCandidate } from "@/domain/adoption/enterprise/entities/adoptionCandidate";

export class InMemoryRepositoriesAdoptionCandidate implements RepositoriesAdoptionCandidate {
  public items: AdoptionCandidate[] = [];

  // Busca pelo ID
  async findById(id: string): Promise<AdoptionCandidate | null> {
    const candidate = this.items.find(c => c.id.toString() === id);
    return candidate ?? null;
  }

  // Cria um novo AdoptionCandidate
  async create(candidate: AdoptionCandidate): Promise<void> {
    this.items.push(candidate);
  }

  // Atualiza um AdoptionCandidate existente
  async update(candidateToUpdate: AdoptionCandidate): Promise<void> {
    const index = this.items.findIndex(c => c.id.toString() === candidateToUpdate.id.toString());
    if (index >= 0) {
      this.items[index] = candidateToUpdate;
    }
  }

  // Bloqueia um AdoptionCandidate (marca isBanned = true)
  async setBlock(candidate: AdoptionCandidate): Promise<void> {
    const index = this.items.findIndex(c => c.id.toString() === candidate.id.toString());
    if (index >= 0) {
      // Atualiza o item diretamente
      this.items[index] = candidate;
    }
  }
}
