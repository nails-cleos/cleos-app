import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DocumentStore } from './document.store';
import { DocumentService } from '../services/document.service';
import { DocumentTypeEnum, IDocument } from '../document/document';

describe('DocumentStore', () => {
  let documentStore: InstanceType<typeof DocumentStore>;
  let documentServiceSpy: {
    getDocumentsPage: Mock;
    view: Mock;
    getDocument: Mock;
    deleteDocument: Mock;
    documentDownloadZip: Mock;
    uploadStatement: Mock;
  };

  beforeEach(() => {
    documentServiceSpy = {
      getDocumentsPage: vi.fn().mockName('DocumentService.getDocumentsPage'),
      view: vi.fn().mockName('DocumentService.view'),
      getDocument: vi.fn().mockName('DocumentService.getDocument'),
      deleteDocument: vi.fn().mockName('DocumentService.deleteDocument'),
      documentDownloadZip: vi
        .fn()
        .mockName('DocumentService.documentDownloadZip'),
      uploadStatement: vi.fn().mockName('DocumentService.uploadStatement'),
    };

    TestBed.configureTestingModule({
      providers: [
        DocumentStore,
        { provide: DocumentService, useValue: documentServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    documentStore = TestBed.inject(DocumentStore);
  });

  it('should load document pages and clear transient error state', () => {
    const date = new Date('2026-06-02T00:00:00.000Z');
    const page = {
      content: [
        { id: '1', name: 'June invoice', date, type: DocumentTypeEnum.invoice },
      ] as IDocument[],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    documentServiceSpy.getDocumentsPage.mockReturnValue(of(page));

    documentStore.loadPage({
      officeId: 'office-1',
      date,
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
      content: [
        {
          id: '1',
          name: 'June statement',
          date,
          type: DocumentTypeEnum.statement,
        },
      ] as IDocument[],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    };
    documentServiceSpy.getDocumentsPage.mockReturnValue(of(page));

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
    documentServiceSpy.view.mockReturnValue(of(blob));

    documentStore.download({ id: 'doc-1', fileName: 'invoice.pdf' });

    expect(documentServiceSpy.view).toHaveBeenCalledWith('doc-1');
    expect(documentStore.response()).toEqual({
      blob,
      fileName: 'invoice.pdf',
    });
    expect(documentStore.isLoading()).toBe(false);
  });

  it('should map zip download failures into error state', () => {
    documentServiceSpy.documentDownloadZip.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: {
              message: 'DOCUMENT.NOT_FOUND',
              subErrors: [{ field: 'date', message: 'No documents found' }],
            },
          }),
      ),
    );

    documentStore.downloadZip({
      officeId: 'office-1',
      date: new Date('2026-06-01T00:00:00.000Z'),
      fileName: 'documents.zip',
    });

    expect(documentStore.response()).toBeUndefined();
    expect(documentStore.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'DOCUMENT.NOT_FOUND',
      }),
    );
    expect(documentStore.subErrors()).toEqual([
      { field: 'date', message: 'No documents found' },
    ]);
    expect(documentStore.isLoading()).toBe(false);
  });

  it('should upload a statement and expose a translated success response', () => {
    const blob = new Blob(['csv'], { type: 'text/csv' });
    documentServiceSpy.uploadStatement.mockReturnValue(of(void 0));

    documentStore.uploadStatement('office-1', blob, 'statement.csv');

    expect(documentServiceSpy.uploadStatement).toHaveBeenCalledWith(
      'office-1',
      blob,
      'statement.csv',
      undefined,
    );

    expect(documentStore.response()).toEqual({
      messageKey: 'DOCUMENT.UPLOAD_SUCCESS',
      messageParams: { fileName: 'statement.csv' },
      redirect: 'statements',
    });
    expect(documentStore.isLoading()).toBe(false);
  });

  it('should map upload failures into error and subErrors state', () => {
    documentServiceSpy.uploadStatement.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              message: 'STATEMENT.UPLOAD_FAILED',
              subErrors: [{ field: 'file', message: 'Invalid format' }],
            },
          }),
      ),
    );

    documentStore.uploadStatement(
      'office-1',
      new Blob(['csv']),
      'statement.csv',
    );

    expect(documentStore.response()).toBeUndefined();
    expect(documentStore.error()).toEqual(
      expect.objectContaining({
        message: 'STATEMENT.UPLOAD_FAILED',
      }),
    );
    expect(documentStore.subErrors()).toEqual([
      { field: 'file', message: 'Invalid format' },
    ]);
    expect(documentStore.isLoading()).toBe(false);
  });

  it('should delete document and show warning toast', () => {
    documentServiceSpy.deleteDocument.mockReturnValue(of(void 0));

    documentStore.delete('1', 'Item A');

    expect(documentServiceSpy.deleteDocument).toHaveBeenCalledWith('1');

    expect(documentStore.response()).toEqual({
      messageKey: 'DOCUMENT.DELETED.MESSAGE',
      messageParams: { name: 'Item A' },
      reload: true,
      toastType: 'warning',
    });

    expect(documentStore.isLoading()).toBe(false);
  });

  it('should clear state using clean()', () => {
    documentServiceSpy.getDocument.mockReturnValue(of({ id: 'doc-1' } as any));

    documentStore.loadById('doc-1');
    documentStore.clean();

    expect(documentStore.selected()).toBeUndefined();
    expect(documentStore.data()).toBeUndefined();
  });

  it('should clear response and error separately', () => {
    documentServiceSpy.getDocument.mockReturnValue(of({ id: 'doc-1' } as any));

    documentStore.loadById('doc-1');

    documentStore.clearResponse();
    expect(documentStore.response()).toBeUndefined();

    documentStore.clearError();
    expect(documentStore.error()).toBeUndefined();
  });
});
