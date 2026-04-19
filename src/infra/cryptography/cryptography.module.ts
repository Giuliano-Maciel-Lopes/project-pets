import { Module } from "@nestjs/common";
import { JwtEncrypter } from "./jwt-encrypter";
import { EncrypterToken } from "@/domain/account/application/encryption/encrypterToken";
import { HashComparer } from "@/domain/account/application/encryption/hash-comparer";
import { HashGenerator } from "@/domain/account/application/encryption/hash-generator";
import { BcryptHasher } from "./bycripts-hashcompara";



const providersCryp = [
  { provide: EncrypterToken, useClass: JwtEncrypter },
  { provide: HashComparer, useClass: BcryptHasher },
  { provide: HashGenerator, useClass: BcryptHasher },
]

@Module({
  providers: [...providersCryp],
  exports: [...providersCryp.map(p => p.provide)],
})
export class CryptographyModule{}