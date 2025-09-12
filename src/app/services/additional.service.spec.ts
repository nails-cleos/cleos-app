import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';

import { AdditionalService } from './additional.service';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { Pagination } from '../interfaces/pagination';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { IApiResponse } from '../interfaces/common';

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

  describe('getAdditionalPage', () => {
    it('should fetch additional page with correct parameters', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getAdditionalPage('name', 'asc', 0, 10).subscribe((result) => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/pages', {
        params: jasmine.any(HttpParams),
      });
    });
  });

  describe('getAllAdditionalByGroupId', () => {
    it('should fetch all additionals by group id with correct parameters', () => {
      const mockAdditionals = [mockAdditional];
      httpSpy.get.and.returnValue(of(mockAdditionals));

      service.getAllAdditionalByGroupId('room1', 'group1').subscribe((result) => {
        expect(result).toEqual(mockAdditionals);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/groups', {
        params: jasmine.any(HttpParams),
      });
    });
  });

  describe('getAdditionalList', () => {
    it('should fetch all additional list', () => {
      const mockAdditionalsList = [mockAdditionalAll];
      httpSpy.get.and.returnValue(of(mockAdditionalsList));

      service.getAdditionalList().subscribe((result) => {
        expect(result).toEqual(mockAdditionalsList);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/additional');
    });
  });

  describe('getAdditional', () => {
    it('should fetch single additional by id', () => {
      httpSpy.get.and.returnValue(of(mockAdditional));

      service.getAdditional('1').subscribe((result) => {
        expect(result).toEqual(mockAdditional);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/additional/1');
    });
  });

  describe('createAdditional', () => {
    it('should create new additional', () => {
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.createAdditional(mockAdditional).subscribe((result) => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/additional', mockAdditional);
    });
  });

  describe('deleteAdditional', () => {
    it('should delete additional by id', () => {
      httpSpy.delete.and.returnValue(of(mockAdditional));

      service.deleteAdditional('1').subscribe((result) => {
        expect(result).toEqual(mockAdditional);
      });

      expect(httpSpy.delete).toHaveBeenCalledWith('v1/additional/1');
    });
  });

  describe('updateAdditional', () => {
    it('should update additional by id', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateAdditional('1', mockAdditional).subscribe((result) => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/additional/1', mockAdditional);
    });
  });

  describe('sortAdditional', () => {
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
});
