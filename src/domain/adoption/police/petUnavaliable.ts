import { Policy } from "@/core/police/policy";
import { petUnavaliableError } from "../errro/petUnavaliableError";
import { Either, left, right } from "@/core/either";
import { PetStatus } from "@/domain/pets/enterprise/entity/pets";
import { PolicyContextEntity } from "@/core/police/AdoptionPolicyContext";


export class PetUnavailblePolicy
  implements Policy<PolicyContextEntity, petUnavaliableError>
{
  validate(context: PolicyContextEntity): Either<petUnavaliableError, void> {
    if (context.pet?.status !== PetStatus.AVAILABLE) {
      return left(new petUnavaliableError());
    }
    return right(undefined);
  }
}
