import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@/domain/account/enterprise/entities/users';

export interface CurrentUserPayload {
  id: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
