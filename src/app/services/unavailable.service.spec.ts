import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { UnavailableService } from './unavailable.service';
import { of } from 'rxjs';
import { createFilter } from '../util/service-helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { IUnavailableAll } from '../unavailable/unavailable';
import { IUserAll } from '../user/user';
import { getNowTimeZone } from '../util/dates';
import { FrequencyEnum } from '../util/helper';

describe('UnavailableService', () => {
  let service: UnavailableService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockProfessional: IUserAll = {
    id: 'prof-1',
    displayName: 'Professional 1',
    email: 'email',
    authorities: [],
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
  };

  const mockUnavailableList: IUnavailableAll[] = [
    {
      id: '1',
      description: 'Desc 1',
      start: '',
      timestamp: getNowTimeZone().getTime() / 1000,
      end: '',
      duration: 'PT1H',
      professional: mockProfessional,
      repeat: FrequencyEnum.none,
      allDay: false,
    },
    {
      id: '2',
      description: 'Desc 2',
      start: '',
      timestamp: getNowTimeZone().getTime() / 1000,
      end: '',
      duration: '',
      professional: mockProfessional,
      repeat: FrequencyEnum.none,
      allDay: true,
    },
  ];

  const mockPagination: Pagination<IUnavailableAll> = {
    content: mockUnavailableList,
    totalElements: 2,
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
      providers: [
        UnavailableService,
        { provide: HttpClient, useValue: httpSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(UnavailableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch unavailable page with correct parameters', () => {
    const page = 0;
    const size = 10;
    const sort = 'name';
    const direction = 'asc';
    httpSpy.get.mockReturnValue(of(mockPagination));

    service
      .getUnavailablePage(page, sort, direction, size)
      .subscribe((result) => {
        expect(result).toEqual(mockPagination);
      });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/unavailable/pages', {
      params: createFilter(page, size, sort, direction),
      ...paginated(),
    });
  });
});
