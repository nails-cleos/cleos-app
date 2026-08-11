import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentStore } from './payment.store';
import { PaymentService } from '../services/payment.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DEFAULT_LOCALE } from '../util/dates';

describe('PaymentStore', () => {
  let store: InstanceType<typeof PaymentStore>;
  let paymentService: {
    getPayment: Mock;
    createPaymentLinkByReservationId: Mock;
    recreate: Mock;
    add: Mock;
    notifyPayment: Mock;
    updatePayment: Mock;
    adjustPayments: Mock;
    getPaymentOptions: Mock;
  };
  let translateSpy: {
    instant: Mock;
    getCurrentLang: Mock;
  };

  beforeEach(() => {
    paymentService = {
      getPayment: vi.fn().mockName('PaymentService.getPayment'),
      createPaymentLinkByReservationId: vi
        .fn()
        .mockName('PaymentService.createPaymentLinkByReservationId'),
      recreate: vi.fn().mockName('PaymentService.recreate'),
      add: vi.fn().mockName('PaymentService.add'),
      notifyPayment: vi.fn().mockName('PaymentService.notifyPayment'),
      updatePayment: vi.fn().mockName('PaymentService.updatePayment'),
      adjustPayments: vi.fn().mockName('PaymentService.adjustPayments'),
      getPaymentOptions: vi.fn().mockName('PaymentService.getPaymentOptions'),
    };
    translateSpy = {
      instant: vi.fn().mockName('TranslateService.instant'),
      getCurrentLang: vi.fn().mockName('TranslateService.getCurrentLang'),
    };
    translateSpy.instant.mockImplementation(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['name'] ?? ''}`,
    );
    translateSpy.getCurrentLang.mockReturnValue(DEFAULT_LOCALE);

    TestBed.configureTestingModule({
      providers: [
        PaymentStore,
        { provide: PaymentService, useValue: paymentService },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
    store = TestBed.inject(PaymentStore);
  });

  describe('clearResponse', () => {
    it('should clear response', () => {
      paymentService.adjustPayments.mockReturnValue(of(void 0));

      store.adjust([]);

      expect(store.response()).toEqual({
        messageKey: 'COMMON.PAYMENT.SUCCESS',
        reload: true,
      });

      store.clearResponse();

      expect(store.response()).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      paymentService.adjustPayments.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
            }),
        ),
      );

      store.adjust([]);

      expect(store.error()).toBeTruthy();

      store.clearError();

      expect(store.error()).toBeUndefined();
      expect(store.subErrors()).toBeUndefined();
    });
  });

  it('should fetch a payment and update `selected` signal', () => {
    const mockPayment = { id: 'pay_123' } as any;
    paymentService.getPayment.mockReturnValue(of(mockPayment));

    store.getPayment('pay_123');

    // Allow observable to emit
    expect(store.selected()).toEqual(mockPayment);
    expect(store.isLoading()).toBe(false);
  });

  it('should open a payment link when creating a payment link by reservation id', () => {
    const mockResponse = { link: 'https://example.com/pay' } as any;
    paymentService.createPaymentLinkByReservationId.mockReturnValue(
      of(mockResponse),
    );
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(undefined as any);

    store.createPaymentLinkByReservationId('res_456', {} as any);

    expect(openSpy).toHaveBeenCalledWith('https://example.com/pay', '_self');
    expect(store.isLoading()).toBe(false);
  });

  it('should reset the store state when `clean` is called', () => {
    const mockPayment = { id: 'pay_789' } as any;
    paymentService.getPayment.mockReturnValue(of(mockPayment));
    store.getPayment('pay_789');

    expect(store.selected()).toEqual(mockPayment);
    store.clean();
    // After clean the selected signal should be undefined (or null)
    expect(store.selected()).toBeUndefined();
  });

  it('should set success response on recreate', () => {
    paymentService.recreate.mockReturnValue(of({}));

    store.recreate('pay_1', 'card');

    expect(store.isLoading()).toBe(false);
    expect(store.response()).toEqual({
      messageKey: 'PAYMENT.RECREATE',
    });
  });

  it('should open payment link on updateById', () => {
    const mock = { paymentLink: 'https://pay.com' } as any;
    paymentService.updatePayment.mockReturnValue(of(mock));
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(undefined as any);

    store.updateById('1', {} as any);

    expect(openSpy).toHaveBeenCalledWith('https://pay.com', '_self');
    expect(store.isLoading()).toBe(false);
  });

  it('should set success response on adjust', () => {
    paymentService.adjustPayments.mockReturnValue(of(void 0));

    store.adjust([{} as any]);

    expect(store.response()).toEqual({
      messageKey: 'COMMON.PAYMENT.SUCCESS',
      reload: true,
    });
    expect(store.isLoading()).toBe(false);
  });

  it('should load payment options', () => {
    const mockOptions = [{ id: 'opt_1' }] as any;
    paymentService.getPaymentOptions.mockReturnValue(of(mockOptions));

    store.getOptions();

    expect(store.options()).toEqual(mockOptions);
    expect(store.isLoading()).toBe(false);
  });

  it('should handle approved create payment response', () => {
    paymentService.add.mockReturnValue(
      of({
        status: 'approved',
        message: 'message',
        paths: ['a', 'b'],
      }),
    );

    store.create('1', 'reservation', 'ok', {} as any);

    expect(store.response()?.messageKey).toBe('COMMON.PAYMENT.SUCCESS');
    expect(store.response()?.redirect).toBe('a/b');
  });

  it('should handle pending notify response', () => {
    paymentService.notifyPayment.mockReturnValue(
      of({
        status: 'pending',
        message: 'message',
        paths: ['a', 'b'],
      }),
    );

    store.notify('1', 'reservation', 'r1', 'p1', 'card');

    expect(store.response()?.toastType).toBe('success');
    expect(store.response()?.reload).toBe(false);
  });
});
