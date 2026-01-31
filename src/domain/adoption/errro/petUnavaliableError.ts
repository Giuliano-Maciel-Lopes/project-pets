import { UseCaseError } from "@/core/erros/use-case-error";

export class petUnavaliableError extends Error implements UseCaseError {
  constructor() {
    super("Pet banido para adoçao");
  }
}