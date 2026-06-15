import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OwnerContext } from '../interfaces/owner-context.interface';

@Injectable()
export class OwnerContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const ownerContext: OwnerContext = {
      userId: undefined,
      temporaryId: undefined,
      isAuthenticated: false,
    };

    if (request.user?.sub) {
      ownerContext.userId = request.user.sub;
      ownerContext.isAuthenticated = true;
    } else {
      const temporaryId =
        request.body?.temporaryId ||
        request.query?.temporaryId ||
        request.headers['x-temporary-id'];

      if (temporaryId) {
        ownerContext.temporaryId = temporaryId;
      }
    }

    request.ownerContext = ownerContext;

    return next.handle();
  }
}
