import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EmptyPagination, EXPECT_PAGINATION } from '../interfaces/pagination';

export const paginationInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const expectsPagination = req.context.get(EXPECT_PAGINATION);

  return next(req).pipe(
    map((event) => {
      if (
        expectsPagination &&
        event instanceof HttpResponse &&
        event.status === 204
      ) {
        return event.clone({
          body: new EmptyPagination<any>(),
        });
      }

      return event;
    }),
  );
};
