import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DocumentStore } from './document.store';
import { DocumentService } from '../services/document.service';
import { DocumentTypeEnum, IDocument } from '../document/document';
import { TranslateService } from '@ngx-translate/core';

describe('DocumentStore', () => {
  let documentStore: InstanceType<typeof DocumentStore>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    documentServiceSpy = jasmine.createSpyObj<DocumentService>('DocumentService', [
      'getDocumentsPage',
      'view',
      'getDocument',
      'deleteDocument',
      'documentDownloadZip',
      'uploadStatement',
    ]);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) => `${ key }:${ params?.['fileName'] ?? '' }`);

    TestBed.configureTestingModule({
      providers: [
        DocumentStore,
        { provide: DocumentService, useValue: documentServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    documentStore = TestBed.inject(DocumentStore);
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

    documentStore.loadPage({ officeId: 'office-1', date, page: 0, sort: 'date', direction: 'desc', size: 10 });

    expect(documentServiceSpy.getDocumentsPage).toHaveBeenCalledWith(
      'office-1',
      0,
      'date',
      'desc',
      10,
      '06-2026',
      undefined,
    );
    expect(documentStore.data()).toEqual(page);
    expect(documentStore.error()).toBeUndefined();
    expect(documentStore.subErrors()).toBeUndefined();
  });

  it('should load statement pages and clear transient error state', () => {
    const date = new Date('2026-06-02T00:00:00.000Z');
    const page = {
      content: [{ id: '1', name: 'June statement', date, type: DocumentTypeEnum.statement }] as IDocument[],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    documentServiceSpy.getDocumentsPage.and.returnValue(of(page));

    documentStore.loadPage({
      officeId: 'office-1',
      types: [DocumentTypeEnum.statement],
      page: 0,
      sort: 'date',
      direction: 'desc',
      size: 10,
    });

    expect(documentServiceSpy.getDocumentsPage).toHaveBeenCalledWith(
      'office-1',
      0,
      'date',
      'desc',
      10,
      undefined,
      [DocumentTypeEnum.statement],
    );
    expect(documentStore.data()).toEqual(page);
    expect(documentStore.error()).toBeUndefined();
    expect(documentStore.subErrors()).toBeUndefined();
  });

  it('should expose file download response metadata on download success', () => {
    const blob = new Blob(['file'], { type: 'application/pdf' });
    documentServiceSpy.view.and.returnValue(of(blob));

    documentStore.download({ id: 'doc-1', fileName: 'invoice.pdf' });

    expect(documentServiceSpy.view).toHaveBeenCalledWith('doc-1');
    expect(documentStore.response()).toEqual({
      blob,
      fileName: 'invoice.pdf',
    });
    expect(documentStore.isLoading()).toBeFalse();
  });

  it('should map zip download failures into error state', () => {
    documentServiceSpy.documentDownloadZip.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 404,
      error: {
        message: 'DOCUMENT.NOT_FOUND',
        subErrors: [{ field: 'date', message: 'No documents found' }],
      },
    })));

    documentStore.downloadZip({
      officeId: 'office-1',
      date: new Date('2026-06-01T00:00:00.000Z'),
      fileName: 'documents.zip',
    });

    expect(documentStore.response()).toBeUndefined();
    expect(documentStore.error()).toEqual(jasmine.objectContaining({
      status: 'NOT_FOUND',
      message: 'DOCUMENT.NOT_FOUND',
    }));
    expect(documentStore.subErrors()).toEqual([{ field: 'date', message: 'No documents found' }]);
    expect(documentStore.isLoading()).toBeFalse();
  });

  it('should upload a statement and expose a translated success response', () => {
    const blob = new Blob(['csv'], { type: 'text/csv' });
    documentServiceSpy.uploadStatement.and.returnValue(of(void 0));

    documentStore.uploadStatement('office-1', blob, 'statement.csv');

    expect(documentServiceSpy.uploadStatement).toHaveBeenCalledWith('office-1', blob, 'statement.csv', undefined);
    expect(translateSpy.instant).toHaveBeenCalledWith('DOCUMENT.UPLOAD_SUCCESS', { fileName: 'statement.csv' });
    expect(documentStore.response()).toEqual({
      message: 'DOCUMENT.UPLOAD_SUCCESS:statement.csv',
      redirect: 'statements',
    });
    expect(documentStore.isLoading()).toBeFalse();
  });

  it('should map upload failures into error and subErrors state', () => {
    documentServiceSpy.uploadStatement.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: {
        message: 'STATEMENT.UPLOAD_FAILED',
        subErrors: [{ field: 'file', message: 'Invalid format' }],
      },
    })));

    documentStore.uploadStatement('office-1', new Blob(['csv']), 'statement.csv');

    expect(documentStore.response()).toBeUndefined();
    expect(documentStore.error()).toEqual(jasmine.objectContaining({
      message: 'STATEMENT.UPLOAD_FAILED',
    }));
    expect(documentStore.subErrors()).toEqual([{ field: 'file', message: 'Invalid format' }]);
    expect(documentStore.isLoading()).toBeFalse();
  });

  it('should delete document and show warning toast', () => {
    documentServiceSpy.deleteDocument.and.returnValue(of(void 0));

    documentStore.delete('1', 'Item A');

    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith('1');

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'DOCUMENT.DELETED.MESSAGE',
      { name: 'Item A' },
    );

    expect(documentStore.response()).toEqual({
      message: 'DOCUMENT.DELETED.MESSAGE:',
      reload: true,
      toastType: 'warning',
    });

    expect(documentStore.isLoading()).toBeFalse();
  });

  it('should clear state using clean()', () => {
    documentServiceSpy.getDocument.and.returnValue(of({ id: 'doc-1' } as any));

    documentStore.loadById('doc-1');
    documentStore.clean();

    expect(documentStore.selected()).toBeUndefined();
    expect(documentStore.data()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    documentServiceSpy.getDocument.and.returnValue(of({ id: 'doc-1' } as any));

    documentStore.loadById('doc-1');

    documentStore.clearResponse();
    expect(documentStore.response()).toBeUndefined();

    documentStore.clearError();
    expect(documentStore.error()).toBeUndefined();
  });
});
