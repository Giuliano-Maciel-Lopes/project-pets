import { EventHandler } from "@/core/events/event-handler";
import { ServiceSetStatusPets } from "../services/setStatus-service-pets";
import { SetStatusEvent } from "@/domain/adoption/enterprise/events/setStatus-Adoption";
import { DomainEvents } from "@/core/events/domain-events";
import { PetStatus } from "../../enterprise/entity/pets";
import { AdoptionStatus } from "@/domain/adoption/enterprise/entities/adoption";

export class OnSetStatusAdoption implements EventHandler {
  constructor(private serviceSetStatusPets: ServiceSetStatusPets) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.SetStatusAdoption.bind(this),
      SetStatusEvent.name
    );
  }

  private async SetStatusAdoption({ adoption }: SetStatusEvent) {
    console.log("teste de mudança de status quando setado a mudança de estado adoption");
    if (adoption.status === AdoptionStatus.APPROVED) {
      await this.serviceSetStatusPets.execute({
        id: adoption.petId.toString(),
        status: PetStatus.UNAVAILABLE,
      });
    }
    if (adoption.status === AdoptionStatus.REJECTED) {
      await this.serviceSetStatusPets.execute({
        id: adoption.petId.toString(),
        status: PetStatus.AVAILABLE,
      });
    }
  }
}
