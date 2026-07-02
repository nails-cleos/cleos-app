import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentStore } from './payment.store';
import { PaymentService } from '../services/payment.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DEFAULT_LOCALE } from '../util/dates';

describe('PaymentStore', () => {
  let store: InstanceType<typeof PaymentStore>;
  let paymentService: jasmine.SpyObj<PaymentService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    paymentService = jasmine.createSpyObj('PaymentService', [
      'getPayment',
      'createPaymentLinkByReservationId',
      'recreate',
      'add',
      'notifyPayment',
      'updatePayment',
      'adjustPayments',
      'getPaymentOptions',
    ]);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant', 'getCurrentLang']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) => `${ key }:${ params?.['name'] ?? '' }`);
    translateSpy.getCurrentLang.and.returnValue(DEFAULT_LOCALE);

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
      paymentService.adjustPayments.and.returnValue(
        of(void 0),
      );

      store.adjust([]);

      expect(store.response()).toEqual({
        message: 'COMMON.PAYMENT.SUCCESS:',
        reload: true,
      });

      store.clearResponse();

      expect(store.response()).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      paymentService.adjustPayments.and.returnValue(
        throwError(() =>
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

  it('should fetch a payment and update `selected` signal', (done) => {
    const mockPayment = { id: 'pay_123' } as any;
    paymentService.getPayment.and.returnValue(of(mockPayment));

    store.getPayment('pay_123');

    // Allow observable to emit
    setTimeout(() => {
      expect(store.selected()).toEqual(mockPayment);
      expect(store.isLoading()).toBeFalse();
      done();
    }, 0);
  });

  it('should open a payment link when creating a payment link by reservation id', (done) => {
    const mockResponse = { link: 'https://example.com/pay' } as any;
    paymentService.createPaymentLinkByReservationId.and.returnValue(of(mockResponse));
    const openSpy = spyOn(window, 'open');

    store.createPaymentLinkByReservationId('res_456', {} as any);

    setTimeout(() => {
      expect(openSpy).toHaveBeenCalledWith('https://example.com/pay', '_self');
      expect(store.isLoading()).toBeFalse();
      done();
    }, 0);
  });

  it('should reset the store state when `clean` is called', (done) => {
    const mockPayment = { id: 'pay_789' } as any;
    paymentService.getPayment.and.returnValue(of(mockPayment));
    store.getPayment('pay_789');

    setTimeout(() => {
      expect(store.selected()).toEqual(mockPayment);
      store.clean();
      // After clean the selected signal should be undefined (or null)
      expect(store.selected()).toBeUndefined();
      done();
    }, 0);
  });

  it('should set success response on recreate', (done) => {
    paymentService.recreate.and.returnValue(of({}));

    store.recreate('pay_1', 'card');

    setTimeout(() => {
      expect(store.isLoading()).toBeFalse();
      expect(store.response()).toEqual({
        message: 'PAYMENT.RECREATE:',
      });
      done();
    }, 0);
  });

  it('should open payment link on updateById', (done) => {
    const mock = { paymentLink: 'https://pay.com' } as any;
    paymentService.updatePayment.and.returnValue(of(mock));
    const openSpy = spyOn(window, 'open');

    store.updateById('1', {} as any);

    setTimeout(() => {
      expect(openSpy).toHaveBeenCalledWith('https://pay.com', '_self');
      expect(store.isLoading()).toBeFalse();
      done();
    }, 0);
  });

  it('should set success response on adjust', (done) => {
    paymentService.adjustPayments.and.returnValue(of(void 0));

    store.adjust([{ } as any]);

    setTimeout(() => {
      expect(store.response()).toEqual({
        message: 'COMMON.PAYMENT.SUCCESS:',
        reload: true,
      });
      expect(store.isLoading()).toBeFalse();
      done();
    }, 0);
  });

  it('should load payment options', (done) => {
    const mockOptions = [{ id: 'opt_1' }] as any;
    paymentService.getPaymentOptions.and.returnValue(of(mockOptions));

    store.getOptions();

    setTimeout(() => {
      expect(store.options()).toEqual(mockOptions);
      expect(store.isLoading()).toBeFalse();
      done();
    }, 0);
  });

  it('should handle approved create payment response', (done) => {
    paymentService.add.and.returnValue(of({
      status: 'approved',
      message: 'message',
      paths: ['a', 'b'],
    }));

    store.create('1', 'reservation', 'ok', {} as any);

    setTimeout(() => {
      expect(store.response()?.message).toBe('COMMON.PAYMENT.SUCCESS:');
      expect(store.response()?.redirect).toBe('a/b');
      done();
    }, 0);
  });

  it('should handle pending notify response', (done) => {
    paymentService.notifyPayment.and.returnValue(of({
      status: 'pending',
      message: 'message',
      paths: ['a', 'b'],
    }));

    store.notify('1', 'reservation', 'r1', 'p1', 'card');

    setTimeout(() => {
      expect(store.response()?.toastType).toBe('success');
      expect(store.response()?.reload).toBe(false);
      done();
    }, 0);
  });
});
