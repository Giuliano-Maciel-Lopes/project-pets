import { PetProps, Pets, PetStatus } from "../../enterprise/entity/pets";

export interface RepositoriesPets {
    
    findById(id:string): Promise <Pets | null>
    create(pets:Pets): Promise <void>
    update(pets:Pets): Promise <void>
    delete(id:string): Promise <void>
    
}