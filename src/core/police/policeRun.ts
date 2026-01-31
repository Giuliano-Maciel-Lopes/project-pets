import { Policy } from './policy';
import { Either, left, right } from '../either';

export class PolicyRunner {
  static async run<TContext, E extends Error = Error>(
    policies: Policy<TContext, E>[],
    context: TContext,
  ): Promise<Either<E, void>> {
    for (const policy of policies) {
      const result = await policy.validate(context); // eslint-disable-line @typescript-eslint/await-thenable
      if (result.isLeft()) {
        return left(result.value); // retorna o primeiro erro que falhar
      }
    }

    return right(undefined); // todas passaram
  }
}
