import { TestBed } from '@angular/core/testing';

import { OfficeService } from './office.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { IOfficeAll } from '../office/office';
import { createFilter } from '../util/service-helper';
import { paginated, Pagination } from '../interfaces/pagination';

describe('OfficeService', () => {
  let service: OfficeService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

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
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        OfficeService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(OfficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all office', () => {
    httpSpy.get.and.returnValue(of([mockOffice]));

    service.getAllMyOffices().subscribe((result) => {
      expect(result).toEqual([mockOffice]);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/me');
  });

  it('should fetch office page with correct parameters', () => {
    const page = 0;
    const size = 10;
    const sort = 'name';
    const direction = 'asc';
    httpSpy.get.and.returnValue(of(mockPagination));

    service.getOfficesPage(page, sort, direction, size).subscribe((result) => {
      expect(result).toEqual(mockPagination);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/pages', {
      params: createFilter(page, size, sort, direction), ...paginated(),
    });
  });
});
