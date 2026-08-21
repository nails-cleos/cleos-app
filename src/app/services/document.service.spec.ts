import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { DocumentService } from './document.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { DocumentTypeEnum, IDocument } from '../document/document';
import { Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { getNowTimeZone } from '../util/dates';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpSpy: Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'> & {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    httpSpy = {
      get: vi.fn().mockName('HttpClient.get'),
      post: vi.fn().mockName('HttpClient.post'),
      patch: vi.fn().mockName('HttpClient.patch'),
      delete: vi.fn().mockName('HttpClient.delete'),
    };
    TestBed.configureTestingModule({
      providers: [DocumentService, { provide: HttpClient, useValue: httpSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    });
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get document', () => {
    const id = '123';
    const document: IDocument = {
      date: getNowTimeZone(),
      type: DocumentTypeEnum.statement,
      id,
      name: 'test.pdf',
    };
    httpSpy.get.mockReturnValue(of(document));

    service.getDocument(id).subscribe((result) => {
      expect(result).toBe(document);
    });

    expect(httpSpy.get).toHaveBeenCalledWith(`v1/documents/${id}`, {
      ...skipLoadingOverlay(),
    });
  });

  it('should download document', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    httpSpy.get.mockReturnValue(of(blob));

    service.view('123').subscribe((result) => {
      expect(result).toBe(blob);
    });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/123/file',
      expect.objectContaining({ responseType: 'blob' }),
    );

    const [, options] = vi.mocked(httpSpy.get).mock.lastCall as any;

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

    httpSpy.get.mockReturnValue(of(response));

    service
      .getDocumentsPage('1', 0, 'date', 'asc', 10, '2026-01')
      .subscribe((result) => {
        expect(result).toEqual(response);
      });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/offices/1/pages',
      expect.objectContaining({ params: expect.any(HttpParams) }),
    );
  });

  it('should fetch paginated documents', () => {
    const response: Pagination<IDocument> = {
      number: 0,
      totalPages: 0,
      content: [],
      totalElements: 0,
    };

    httpSpy.get.mockReturnValue(of(response));

    service
      .getDocumentsPage('1', 0, 'date', 'asc', 10, undefined, [
        DocumentTypeEnum.statement,
      ])
      .subscribe((result) => {
        expect(result).toEqual(response);
      });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/offices/1/pages',
      expect.objectContaining({ params: expect.any(HttpParams) }),
    );
  });

  it('should download zip', () => {
    const blob = new Blob(['test'], { type: 'application/zip' });
    const date = '01-2026';
    httpSpy.get.mockReturnValue(of(blob));

    service.documentDownloadZip('123', date).subscribe((result) => {
      expect(result).toBe(blob);
    });

    expect(httpSpy.get).toHaveBeenCalledWith(
      'v1/documents/offices/123',
      expect.objectContaining({ responseType: 'blob' }),
    );

    const [, options] = vi.mocked(httpSpy.get).mock.lastCall as any;

    expect(options.responseType).toBe('blob');
    expect(options.headers.get('Accept')).toBe('application/zip');
    expect(options.params.get('date')).toBe(date);
  });
});
