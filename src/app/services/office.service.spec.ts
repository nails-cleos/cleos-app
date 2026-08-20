import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { OfficeService } from './office.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { IOfficeAll } from '../office/office';
import { createFilter } from '../util/service-helper';
import {
  paginated,
  Pagination,
  skipLoadingOverlay,
} from '../interfaces/pagination';

describe('OfficeService', () => {
  let service: OfficeService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const mockPagination: Pagination<IOfficeAll> = {
    content: [mockOffice],
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
      providers: [OfficeService, { provide: HttpClient, useValue: httpSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(OfficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all office', () => {
    httpSpy.get.mockReturnValue(of([mockOffice]));

    service.getAllMyOffices().subscribe((result) => {
      expect(result).toEqual([mockOffice]);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/me', {
      ...skipLoadingOverlay(),
    });
  });

  it('should fetch office page with correct parameters', () => {
    const page = 0;
    const size = 10;
    const sort = 'name';
    const direction = 'asc';
    httpSpy.get.mockReturnValue(of(mockPagination));

    service.getOfficesPage(page, sort, direction, size).subscribe((result) => {
      expect(result).toEqual(mockPagination);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/pages', {
      params: createFilter(page, size, sort, direction),
      ...paginated(),
    });
  });
});
