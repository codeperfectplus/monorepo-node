import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Role } from './roles.decorator';

export type CurrentUserPayload = {
  sub: string;
  email: string;
  role: Role;
  exp: number;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
},
);
