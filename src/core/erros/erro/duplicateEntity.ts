import { UseCaseError } from "../use-case-error"; 

export class DuplicateSlugNameError extends Error implements UseCaseError {
  constructor( entityName:string , name: string ) {
    super(`Já existe uma ${entityName}  com o nome "${name}"!`);
  }
}