import { HashComparer } from "@/domain/account/application/encryption/hash-comparer";
import { HashGenerator } from "@/domain/account/application/encryption/hash-generator";
import { hash, compare } from 'bcryptjs'


export class BcryptHasher implements HashComparer, HashGenerator {
    hash(passPlain: string): Promise<string> {
        return hash(passPlain , 8 )
       
    }
    compare(passPlain: string, hash: string): Promise<boolean> {
        return  compare(passPlain , hash)
        
    }
}
