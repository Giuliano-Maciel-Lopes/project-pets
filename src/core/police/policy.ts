import { Either } from "../either";

export interface Policy<TContext, E extends Error = Error> {
  validate(context: TContext): Either<E, void>;
}
