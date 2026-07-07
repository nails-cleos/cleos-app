import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { InvoiceStore } from './invoice.store';
import { InvoiceService } from '../services/invoice.service';

describe('InvoiceStore', () => {
  let store: InstanceType<typeof InvoiceStore>;
  let invoiceServiceSpy: jasmine.SpyObj<InvoiceService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    invoiceServiceSpy = jasmine.createSpyObj<InvoiceService>('InvoiceService', [
      'getInvoicesPage',
      'getOfficeToInvoice',
      'uploadInvoices',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['fileName'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        InvoiceStore,
        { provide: InvoiceService, useValue: invoiceServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(InvoiceStore);
  });

  it('should load invoice page and set page state', () => {
    const page = { content: [] } as any;
    invoiceServiceSpy.getInvoicesPage.and.returnValue(of(page));

    store.loadPage({
      officeId: 'office-1',
      page: 0,
      size: 10,
      sort: 'date',
      direction: 'desc',
    });

    expect(invoiceServiceSpy.getInvoicesPage).toHaveBeenCalledWith(
      'office-1',
      0,
      'date',
      'desc',
      10,
    );

    expect(store.page()).toEqual(page);
    expect(store.isLoading()).toBeFalse();
  });

  it('should load office to invoice data', () => {
    const data = [{ id: '1' }] as any;
    invoiceServiceSpy.getOfficeToInvoice.and.returnValue(of(data));

    store.loadOfficeToInvoice('office-1', '2026-01-01', '2026-01-31', ['A', 'B']);

    expect(invoiceServiceSpy.getOfficeToInvoice).toHaveBeenCalledWith(
      'office-1',
      '2026-01-01',
      '2026-01-31',
      ['A', 'B'],
    );

    expect(store.data()).toEqual(data);
    expect(store.isLoading()).toBeFalse();
  });

  it('should upload invoices when upload=true', () => {
    invoiceServiceSpy.uploadInvoices.and.returnValue(of(void 0));

    const blob = new Blob(['file'], { type: 'text/plain' });

    store.uploadInvoices('office-1', blob, 'file.txt', true);

    expect(invoiceServiceSpy.uploadInvoices).toHaveBeenCalledWith(
      'office-1',
      blob,
      'file.txt',
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'INVOICE.UPLOAD_SUCCESS',
      { fileName: 'file.txt' },
    );

    expect(store.response()).toEqual({
      message: 'INVOICE.UPLOAD_SUCCESS:file.txt',
      blob,
      fileName: 'file.txt',
    } as any);

    expect(store.isLoading()).toBeFalse();
  });

  it('should NOT call service when upload=false (early return)', () => {
    const blob = new Blob(['file'], { type: 'text/plain' });

    store.uploadInvoices('office-1', blob, 'file.txt', false);

    expect(invoiceServiceSpy.uploadInvoices).not.toHaveBeenCalled();

    expect(store.response()).toEqual({
      message: 'INVOICE.UPLOAD_SUCCESS:file.txt',
      blob,
      fileName: 'file.txt',
    } as any);

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into store error state', () => {
    invoiceServiceSpy.getInvoicesPage.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 400,
          error: { message: 'INVOICE.ERROR' },
        }),
      ),
    );

    store.loadPage({
      officeId: 'office-1',
      page: 0,
      size: 10,
      sort: 'date',
      direction: 'asc',
    });

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        message: 'INVOICE.ERROR',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should clean state and reset everything', () => {
    invoiceServiceSpy.getInvoicesPage.and.returnValue(of({ content: [] } as any));

    store.loadPage({
      officeId: 'office-1',
      page: 0,
      size: 10,
      sort: 'date',
      direction: 'asc',
    });

    store.clean();

    expect(store.page()).toBeUndefined();
    expect(store.data()).toBeUndefined();
  });

  it('should clear response and error', () => {
    invoiceServiceSpy.getInvoicesPage.and.returnValue(of({ content: [] } as any));

    store.loadPage({
      officeId: 'office-1',
      page: 0,
      size: 10,
      sort: 'date',
      direction: 'asc',
    });

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
