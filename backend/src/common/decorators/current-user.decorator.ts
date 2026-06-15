import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OwnerContext } from '../interfaces/owner-context.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof OwnerContext | undefined, ctx: ExecutionContext): OwnerContext => {
    const request = ctx.switchToHttp().getRequest();
    const ownerContext: OwnerContext = request.ownerContext;

    if (data) {
      return ownerContext?.[data] as any;
    }

    return ownerContext;
  },
);
