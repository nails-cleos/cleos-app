import { TestBed } from '@angular/core/testing';

import { DocumentService } from './document.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { IDocument } from '../document/document';
import { Pagination } from '../interfaces/pagination';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should download document', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    httpSpy.get.and.returnValue(of(blob));

    service.view('123').subscribe(result => {
      expect(result).toBe(blob);
    });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/123',
      jasmine.objectContaining({ responseType: 'blob' }),
    );

    const [, options] = httpSpy.get.calls.mostRecent().args as any;

    expect(options.responseType).toBe('blob');
    expect(options.headers.get('Accept')).toBe('application/octet-stream');
  });

  it('should fetch paginated documents', () => {
    const response: Pagination<IDocument> = {
      number: 0,
      totalPages: 0,
      content: [],
      totalElements: 0,
    };

    httpSpy.get.and.returnValue(of(response));

    service.getDocumentsPage('1', '2026-01', 0, 'date', 'asc', 10)
      .subscribe(result => {
        expect(result).toEqual(response);
      });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/offices/1/pages',
      jasmine.objectContaining({ params: jasmine.any(HttpParams) }),
    );
  });

  it('should download zip', () => {
    const blob = new Blob(['test'], { type: 'application/zip' });
    const date = '01-2026';
    httpSpy.get.and.returnValue(of(blob));

    service.documentDownloadZip('123', date).subscribe(result => {
      expect(result).toBe(blob);
    });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/offices/123',
      jasmine.objectContaining({ responseType: 'blob' }),
    );

    const [, options] = httpSpy.get.calls.mostRecent().args as any;

    expect(options.responseType).toBe('blob');
    expect(options.headers.get('Accept')).toBe('application/zip');
    expect(options.params.get('date')).toBe(date);
  });
});
