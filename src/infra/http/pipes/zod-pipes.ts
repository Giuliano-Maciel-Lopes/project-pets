import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodError, ZodType, ZodTypeAny } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private schema: T) {} // schema tipado corretamente

  transform(value: unknown) {
    try {
      return this.schema.parse(value) // retorna tipo inferido do schema
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
