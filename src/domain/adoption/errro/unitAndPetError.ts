import { UseCaseError } from "@/core/erros/use-case-error";

export class UnitAndPetDistincsError extends Error implements UseCaseError {
  constructor() {
    super("esse pet não pertence a essa unidade");
  }
}