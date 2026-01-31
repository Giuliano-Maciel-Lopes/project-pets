import { EventHandler } from "@/core/events/event-handler";
import { ServiceSetStatusPets } from "../services/setStatus-service-pets";
import { PetStatus } from "../../enterprise/entity/pets";
import { CreateAdoptionEvent } from "@/domain/adoption/enterprise/events/create-adoption";
import { DomainEvents } from "@/core/events/domain-events";

export class OncreateAdoption implements EventHandler{
    constructor(private serviceSetStatusPets: ServiceSetStatusPets){
        this.setupSubscriptions()
    }

    
    setupSubscriptions(): void {
        DomainEvents.register(this.handleStatusPet.bind(this), CreateAdoptionEvent.name) 
        // DomainEvents.register(this.handleStatusPet.bind(this), CreateAdoptionEvent.name) dps adicioanr um teste de notificaçao par ausuarios etc   
       
    }

    private async handleStatusPet({adoption}:CreateAdoptionEvent){
        console.log(adoption)
       await this.serviceSetStatusPets.execute({id:adoption.petId.toString() , status:PetStatus.ANALYSIS})
    }
    
}