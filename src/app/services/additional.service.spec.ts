import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';

import { AdditionalService } from './additional.service';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { Pagination } from '../interfaces/pagination';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { IApiResponse } from '../interfaces/common';
import { createFilter } from '../util/service-helper';

describe('AdditionalService', () => {
  let service: AdditionalService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockAdditional: IAdditional = {
    id: '1',
    name: 'Test Additional',
    description: 'Test Description',
    price: 100,
    duration: '30min',
    groupIds: ['group1'],
  };

  const mockAdditionalAll: IAdditionalAll = {
    key: 'test-key',
    id: '1',
    name: 'Test Additional All',
    price: 100,
    type: 'additional' as any,
    duration: '30min',
    description: 'Test Description',
  };

  const mockPagination: Pagination<IAdditional> = {
    content: [mockAdditional],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockApiResponse: IApiResponse = {
    id: '1',
    name: 'Test Additional',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        AdditionalService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(AdditionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch additional page with correct parameters', () => {
    const page = 0;
    const size = 10;
    const sort = 'name';
    const direction = 'asc';
    httpSpy.get.and.returnValue(of(mockPagination));

    service.getAdditionalPage(sort, direction, page, size).subscribe((result) => {
      expect(result).toEqual(mockPagination);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/pages', {
      params: createFilter(page, size, sort, direction),
    });
  });

  it('should fetch all additionalList by group id with correct parameters', () => {
    const roomId = 'roomId';
    const groupId = 'groupId';
    const additionalList = [mockAdditionalAll];
    httpSpy.get.and.returnValue(of(additionalList));

    service.getAllAdditionalByGroupId(roomId, groupId).subscribe((result) => {
      expect(result).toEqual(additionalList);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/groups', {
      params: new HttpParams().set('roomId', roomId).set('groupId', groupId),
    });
  });

  it('should fetch all additional list', () => {
    const mockAdditionalList = [mockAdditionalAll];
    httpSpy.get.and.returnValue(of(mockAdditionalList));

    service.getAdditionalList().subscribe((result) => {
      expect(result).toEqual(mockAdditionalList);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/additional');
  });

  it('should fetch single additional by id', () => {
    httpSpy.get.and.returnValue(of(mockAdditional));

    service.getAdditional('1').subscribe((result) => {
      expect(result).toEqual(mockAdditional);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/1');
  });

  it('should create new additional', () => {
    httpSpy.post.and.returnValue(of(mockApiResponse));

    service.createAdditional(mockAdditional).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.post).toHaveBeenCalledWith('v1/additional', mockAdditional);
  });

  it('should delete additional by id', () => {
    httpSpy.delete.and.returnValue(of(mockAdditional));

    service.deleteAdditional('1').subscribe((result) => {
      expect(result).toEqual(mockAdditional);
    });

    expect(httpSpy.delete).toHaveBeenCalledWith('v1/additional/1');
  });

  it('should update additional by id', () => {
    httpSpy.patch.and.returnValue(of(mockApiResponse));

    service.updateAdditional('1', mockAdditional).subscribe((result) => {
      expect(result).toEqual(mockApiResponse);
    });

    expect(httpSpy.patch).toHaveBeenCalledWith('v1/additional/1', mockAdditional);
  });

  it('should sort additionals', () => {
    const mockSortedList: ISorted[] = [{ key: '1', order: 0 }];
    const mockResult = [mockAdditionalAll];
    httpSpy.patch.and.returnValue(of(mockResult));

    service.sortAdditional(mockSortedList).subscribe((result) => {
      expect(result).toEqual(mockResult);
    });

    expect(httpSpy.patch).toHaveBeenCalledWith('v1/additional', mockSortedList);
  });
});
