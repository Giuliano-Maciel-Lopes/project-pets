import { Policy } from "@/core/police/policy";
import { CandidateBannedError } from "../errro/candidateBannedError";
import { Either, left, right } from "@/core/either";
import { PolicyContextEntity } from "@/core/police/AdoptionPolicyContext";

export class CandidateMustNotBeBannedPolicy
  implements Policy< PolicyContextEntity, CandidateBannedError>
{
  validate(context:PolicyContextEntity): Either<CandidateBannedError, void> {
    if (context.candidate && context.candidate.isBanned) {
      return left(new CandidateBannedError());
    }

    return right(undefined); 
  }
}
