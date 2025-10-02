import { TestBed } from '@angular/core/testing';

import { CatalogueService } from './catalogue.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';

describe('CatalogueService', () => {
  let service: CatalogueService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockCatalogue: ICatalogue = {
    id: '1',
    name: 'Test Catalogue',
    description: 'A test catalogue',
    home: true,
    catalog: false,
    file: null,
    blob: null,
    groupId: 'group1',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete', 'put']);
    TestBed.configureTestingModule({
      providers: [
        CatalogueService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(CatalogueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCatalogues', () => {
    it('should get all catalogues', () => {
      httpSpy.get.and.returnValue(of([mockCatalogue]));

      service.getAllCatalogues().subscribe(result => {
        expect(result).toEqual([mockCatalogue]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/catalogues');
    });
  });

  describe('getAll', () => {
    it('should get all catalogs', () => {
      httpSpy.get.and.returnValue(of([mockCatalogue]));

      service.getAllCatalogs().subscribe(result => {
        expect(result).toEqual([mockCatalogue]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/catalogues', {
        params: new HttpParams().set('catalog', 'true'),
      });
    });

    it('should get all home catalogs', () => {
      httpSpy.get.and.returnValue(of([mockCatalogue]));

      service.getAllHome().subscribe(result => {
        expect(result).toEqual([mockCatalogue]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/catalogues', {
        params: new HttpParams().set('home', 'true'),
      });
    });
  });

  it('should fetch single catalogue by id', () => {
    httpSpy.get.and.returnValue(of(mockCatalogue));

    service.getCatalogue('1').subscribe((result) => {
      expect(result).toEqual(mockCatalogue);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/catalogues/1');
  });

  describe('createCatalogue', () => {
    it('should create catalogue with FormData and image', () => {
      const mockDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQE=';
      const mockApiResponse = { id: 'response-123', name: 'Catalogue created successfully' };
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.createCatalogue(mockCatalogue, mockDataUrl).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/catalogues',
        jasmine.any(FormData),
        jasmine.objectContaining({
          headers: jasmine.any(Object),
        }),
      );
    });
  });

  describe('deleteCatalogue', () => {
    it('should delete catalogue by id', () => {
      httpSpy.delete.and.returnValue(of(mockCatalogue));

      service.deleteCatalogue('1').subscribe(result => {
        expect(result).toEqual(mockCatalogue);
      });

      expect(httpSpy.delete).toHaveBeenCalledWith('v1/catalogues/1');
    });
  });

  describe('updateCatalogue', () => {
    it('should update catalogue with FormData and image', () => {
      const mockDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQE=';
      const mockApiResponse = { id: 'response-123', name: 'Catalogue updated successfully' };
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateCatalogue(mockCatalogue, mockDataUrl).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/catalogues/1',
        jasmine.any(FormData),
        jasmine.objectContaining({
          headers: jasmine.any(Object),
        }),
      );
    });
  });

  describe('updateCatalogueOrder', () => {
    it('should update catalogue order', () => {
      const cataloguesAll: ICatalogueAll[] = [
        {
          id: '1',
          order: 0,
          name: 'Catalogue 1',
          contentType: '',
          blob: undefined,
          image: undefined,
        },
        {
          id: '2',
          order: 1,
          name: 'Catalogue 2',
          contentType: '',
          blob: undefined,
          image: undefined,
        },
        {
          id: '3',
          order: 2,
          name: 'Catalogue 3',
          contentType: '',
          blob: undefined,
          image: undefined,
        },
      ];
      httpSpy.put.and.returnValue(of(undefined));

      service.updateCatalogueOrder(cataloguesAll).subscribe();

      expect(httpSpy.put).toHaveBeenCalledWith('v1/catalogues/order', [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ]);
    });

    it('should handle empty catalogues array', () => {
      httpSpy.put.and.returnValue(of(undefined));

      service.updateCatalogueOrder([]).subscribe();

      expect(httpSpy.put).toHaveBeenCalledWith('v1/catalogues/order', []);
    });
  });
});
