import { Units } from "../../enterprise/entities/unity";

export interface RepositoriesUnits {
 
  findBySlug(slug: string): Promise<Units |null>;
  findById(id: string): Promise<Units |null>;
  list():Promise<Units[]>
  create(units: Units): Promise<void>;
  delete(id:string): Promise<void >;
  toggleActive(id:string , isActiveValue:boolean): Promise<void >;
  update(id:string, units:Units): Promise<void >;
 
  
}
