import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { DiscountService } from './discount.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { createFilter } from '../util/service-helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { DiscountType, IDiscountAll } from '../discount/discount';

describe('DiscountService', () => {
  let service: DiscountService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockDiscountAll: IDiscountAll = {
    amount: 10,
    currency: {},
    id: '1',
    name: 'Test discount',
    type: DiscountType.money,
    description: 'Test discount',
  };

  const mockPagination: Pagination<IDiscountAll> = {
    content: [mockDiscountAll],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    httpSpy = {
      get: vi.fn().mockName('HttpClient.get'),
      post: vi.fn().mockName('HttpClient.post'),
      patch: vi.fn().mockName('HttpClient.patch'),
      delete: vi.fn().mockName('HttpClient.delete'),
    };
    TestBed.configureTestingModule({
      providers: [DiscountService, { provide: HttpClient, useValue: httpSpy }],
    });
    service = TestBed.inject(DiscountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch discount page with correct parameters', () => {
    const page = 0;
    const size = 10;
    const sort = 'name';
    const direction = 'asc';
    httpSpy.get.mockReturnValue(of(mockPagination));

    service
      .getDiscountsPage(page, sort, direction, size)
      .subscribe((result) => {
        expect(result).toEqual(mockPagination);
      });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/discounts/pages', {
      params: createFilter(page, size, sort, direction),
      ...paginated(),
    });
  });
});
