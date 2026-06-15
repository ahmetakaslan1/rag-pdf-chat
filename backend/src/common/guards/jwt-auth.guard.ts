import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (err || !user) {
      if (isPublic) {
        return null as any;
      }
      throw err || new UnauthorizedException('Geçersiz veya eksik erişim tokeni.');
    }
    return user;
  }
}
