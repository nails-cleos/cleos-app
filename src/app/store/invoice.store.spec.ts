import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { InvoiceStore } from './invoice.store';
import { InvoiceService } from '../services/invoice.service';

describe('InvoiceStore', () => {
  let store: InstanceType<typeof InvoiceStore>;
  let invoiceServiceSpy: {
    getOfficeToInvoice: Mock;
    uploadInvoices: Mock;
  };

  beforeEach(() => {
    invoiceServiceSpy = {
      getOfficeToInvoice: vi.fn().mockName('InvoiceService.getOfficeToInvoice'),
      uploadInvoices: vi.fn().mockName('InvoiceService.uploadInvoices'),
    };

    TestBed.configureTestingModule({
      providers: [
        InvoiceStore,
        { provide: InvoiceService, useValue: invoiceServiceSpy },
      ],
    });

    store = TestBed.inject(InvoiceStore);
  });

  it('should load office to invoice data', () => {
    const data = [{ id: '1' }] as any;
    invoiceServiceSpy.getOfficeToInvoice.mockReturnValue(of(data));

    store.loadOfficeToInvoice('office-1', '2026-01-01', '2026-01-31', [
      'A',
      'B',
    ]);

    expect(invoiceServiceSpy.getOfficeToInvoice).toHaveBeenCalledWith(
      'office-1',
      '2026-01-01',
      '2026-01-31',
      ['A', 'B'],
    );

    expect(store.data()).toEqual(data);
    expect(store.isLoading()).toBe(false);
  });

  it('should upload invoices when upload=true', () => {
    invoiceServiceSpy.uploadInvoices.mockReturnValue(of(void 0));

    const blob = new Blob(['file'], { type: 'text/plain' });

    store.uploadInvoices('office-1', blob, 'file.txt', true);

    expect(invoiceServiceSpy.uploadInvoices).toHaveBeenCalledWith(
      'office-1',
      blob,
      'file.txt',
    );

    expect(store.response()).toEqual({
      messageKey: 'INVOICE.UPLOAD_SUCCESS',
      messageParams: { fileName: 'file.txt' },
      blob,
      fileName: 'file.txt',
    } as any);

    expect(store.isLoading()).toBe(false);
  });

  it('should NOT call service when upload=false (early return)', () => {
    const blob = new Blob(['file'], { type: 'text/plain' });

    store.uploadInvoices('office-1', blob, 'file.txt', false);

    expect(invoiceServiceSpy.uploadInvoices).not.toHaveBeenCalled();

    expect(store.response()).toEqual({
      messageKey: 'INVOICE.UPLOAD_SUCCESS',
      messageParams: { fileName: 'file.txt' },
      blob,
      fileName: 'file.txt',
    } as any);

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into store error state', () => {
    invoiceServiceSpy.getOfficeToInvoice.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'INVOICE.ERROR' },
          }),
      ),
    );

    store.loadOfficeToInvoice('office-1', '2026-01-01', '2026-01-31', [
      'A',
      'B',
    ]);

    expect(store.error()).toEqual(
      expect.objectContaining({
        message: 'INVOICE.ERROR',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should clean state and reset everything', () => {
    invoiceServiceSpy.getOfficeToInvoice.mockReturnValue(
      of({ content: [] } as any),
    );

    store.loadOfficeToInvoice('office-1', '2026-01-01', '2026-01-31', [
      'A',
      'B',
    ]);

    store.clean();

    expect(store.data()).toBeUndefined();
  });

  it('should clear response and error', () => {
    invoiceServiceSpy.uploadInvoices.mockReturnValue(of(void 0));
    store.uploadInvoices(
      'office-1',
      new Blob(['test'], { type: 'application/pdf' }),
      'fileName',
      true,
    );

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});
