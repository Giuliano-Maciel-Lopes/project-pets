import { UseCaseError } from "@/core/erros/use-case-error"

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() {
    super(`email ou senha invalido!!.`)
  }
}
