import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DocumentStore } from './document.store';
import { DocumentService } from '../services/document.service';
import { DocumentTypeEnum, IDocument } from '../document/document';

describe('DocumentStore', () => {
  let store: InstanceType<typeof DocumentStore>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;

  beforeEach(() => {
    documentServiceSpy = jasmine.createSpyObj<DocumentService>('DocumentService', [
      'getDocumentsPage',
      'view',
      'documentDownloadZip',
    ]);

    TestBed.configureTestingModule({
      providers: [
        DocumentStore,
        { provide: DocumentService, useValue: documentServiceSpy },
      ],
    });

    store = TestBed.inject(DocumentStore);
  });

  it('should load document pages and clear transient error state', () => {
    const date = new Date('2026-06-02T00:00:00.000Z');
    const page = {
      content: [{ id: '1', name: 'June invoice', date, type: DocumentTypeEnum.invoice }] as IDocument[],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    documentServiceSpy.getDocumentsPage.and.returnValue(of(page));

    store.loadPage({ officeId: 'office-1', date, page: 0, sort: 'date', direction: 'desc', size: 10 });

    expect(documentServiceSpy.getDocumentsPage).toHaveBeenCalledWith(
      'office-1',
      '06-2026',
      0,
      'date',
      'desc',
      10,
    );
    expect(store.data()).toEqual(page);
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
  });

  it('should expose file download response metadata on download success', () => {
    const blob = new Blob(['file'], { type: 'application/pdf' });
    documentServiceSpy.view.and.returnValue(of(blob));

    store.download({ id: 'doc-1', fileName: 'invoice.pdf' });

    expect(documentServiceSpy.view).toHaveBeenCalledWith('doc-1');
    expect(store.response()).toEqual({
      blob,
      fileName: 'invoice.pdf',
    });
    expect(store.isLoading()).toBeFalse();
  });

  it('should map zip download failures into error state', () => {
    documentServiceSpy.documentDownloadZip.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 404,
      error: {
        message: 'DOCUMENT.NOT_FOUND',
        subErrors: [{ field: 'date', message: 'No documents found' }],
      },
    })));

    store.downloadZip({
      officeId: 'office-1',
      date: new Date('2026-06-01T00:00:00.000Z'),
      fileName: 'documents.zip',
    });

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      status: 'NOT_FOUND',
      message: 'DOCUMENT.NOT_FOUND',
    }));
    expect(store.subErrors()).toEqual([{ field: 'date', message: 'No documents found' }]);
    expect(store.isLoading()).toBeFalse();
  });
});
