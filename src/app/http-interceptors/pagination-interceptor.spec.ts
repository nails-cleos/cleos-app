import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { EmptyPagination, paginated } from '../interfaces/pagination';
import { paginationInterceptor } from './pagination-interceptor';

describe('paginationInterceptor', () => {
  it('should replace 204 response with EmptyPagination when pagination is expected', async () => {
    const req = new HttpRequest('GET', '/v1/items').clone(paginated());
    const next: HttpHandlerFn = () => of(new HttpResponse({ status: 204 }));

    const event = await firstValueFrom(paginationInterceptor(req, next));
    const response = event as HttpResponse<EmptyPagination<unknown>>;

    expect(response.status).toBe(204);
    expect(response.body).toEqual(jasmine.objectContaining({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      last: true,
    }));
  });

  it('should keep response unchanged when pagination is not expected', async () => {
    const req = new HttpRequest('GET', '/v1/items');
    const original = new HttpResponse({ status: 204, body: null });
    const next: HttpHandlerFn = () => of(original);

    const event = await firstValueFrom(paginationInterceptor(req, next));
    expect(event).toBe(original);
  });

  it('should keep response unchanged for non-204 statuses', async () => {
    const req = new HttpRequest('GET', '/v1/items').clone(paginated());
    const original = new HttpResponse({ status: 200, body: { content: ['a'] } });
    const next: HttpHandlerFn = () => of(original);

    const event = await firstValueFrom(paginationInterceptor(req, next));
    expect(event).toBe(original);
  });
});
