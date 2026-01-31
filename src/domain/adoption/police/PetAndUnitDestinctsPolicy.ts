import { Policy } from "@/core/police/policy";
import { UnitAndPetDistincsError } from "../errro/unitAndPetError";
import { Either, left, right } from "@/core/either";
import { PolicyContextEntity } from "@/core/police/AdoptionPolicyContext";



export class UnitAndPetDistincsPolicy
  implements Policy<PolicyContextEntity, UnitAndPetDistincsError>
{
  validate(context: PolicyContextEntity ): Either<UnitAndPetDistincsError, void> {
    if(context.pet?.unitId.toString() !== context.unit?.id.toString() ){
     return left(new UnitAndPetDistincsError())
    }
    return right(undefined)
    }
}
