import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { PaymentService } from './payment.service';
import {
  IPay,
  IPaymentAll,
  IPaymentRequest,
  IPaymentStatus,
  PaymentPercentage,
  PaymentType,
} from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';
import { IApiResponse } from '../interfaces/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockPayment: IPaymentAll = {
    description: 'description',
    paymentId: 'paymentId',
    id: 'payment-123',
    status: 'completed',
    type: PaymentType.mollie,
    amount: 100,
    timestamp: Date.now(),
    preferenceId: 'pref-123',
  };

  const mockPaymentStatus: IPaymentStatus = {
    paymentId: 'status-123',
    paymentType: PaymentType.ideal,
    preferenceId: 'pref-123',
  };

  const mockPay: IPay = {
    message: 'payment successful',
    status: 'success',
    paths: ['reservation', 'payment', 'success'],
  };

  const mockReservationPayment: IReservationPayment = {
    type: PaymentType.ideal,
    amount: 150,
    percentage: PaymentPercentage.total,
  };

  const mockPaymentRequest: IPaymentRequest = {
    paymentType: PaymentType.ideal,
    paymentId: 'option-123',
    amount: 100,
  };

  const mockApiResponse: IApiResponse = {
    id: 'response-123',
    name: 'Payment updated successfully',
    paymentLink: 'http://payment-link.com',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        PaymentService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPayment', () => {
    it('should get payment by id', () => {
      httpSpy.get.and.returnValue(of(mockPayment));

      service.getPayment('payment-123').subscribe(result => {
        expect(result).toEqual(mockPayment);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/payments/payment-123');
    });
  });

  describe('add', () => {
    it('should add payment for reservation', () => {
      httpSpy.post.and.returnValue(of(mockPay));

      service.add('res-123', 'reservation', 'pending', mockPaymentStatus).subscribe(result => {
        expect(result).toEqual(mockPay);
      });

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/reservations/res-123/payments/pending',
        mockPaymentStatus,
      );
    });

    it('should add payment for transaction', () => {
      httpSpy.post.and.returnValue(of(mockPay));

      service.add('trans-123', 'transaction', 'approved', mockPaymentStatus).subscribe(result => {
        expect(result).toEqual(mockPay);
      });

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/accounts/transactions/trans-123/payments/approved',
        mockPaymentStatus,
      );
    });
  });

  describe('createPaymentLinkByReservationId', () => {
    it('should create payment link for reservation', () => {
      httpSpy.post.and.returnValue(of(mockPayment));

      service.createPaymentLinkByReservationId('res-123', mockReservationPayment).subscribe(result => {
        expect(result).toEqual(mockPayment);
      });

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/payments/reservations/res-123',
        mockReservationPayment,
      );
    });
  });

  describe('adjustPayments', () => {
    it('should adjust payments', () => {
      const paymentRequests = [mockPaymentRequest];
      httpSpy.patch.and.returnValue(of(undefined));

      service.adjustPayments(paymentRequests).subscribe();

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/payments', paymentRequests);
    });
  });

  describe('updatePayment', () => {
    it('should update payment', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updatePayment('payment-123', mockReservationPayment).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/payments/payment-123',
        mockReservationPayment,
      );
    });
  });

  describe('recreate', () => {
    it('should recreate payment with new type', () => {
      httpSpy.patch.and.returnValue(of(mockPayment));

      service.recreate('payment-123', PaymentType.ideal).subscribe(result => {
        expect(result).toEqual(mockPayment);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/payments/payment-123/types/IDEAL',
        null,
      );
    });
  });

  describe('getPaymentByResourceId', () => {
    it('should get payments by reservation id', () => {
      const payments = [mockPayment];
      httpSpy.get.and.returnValue(of(payments));

      service.getPaymentByResourceId('res-123', 'reservation').subscribe(result => {
        expect(result).toEqual(payments);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123/payments');
    });

    it('should get payments by transaction id', () => {
      const payments = [mockPayment];
      httpSpy.get.and.returnValue(of(payments));

      service.getPaymentByResourceId('trans-123', 'transaction').subscribe(result => {
        expect(result).toEqual(payments);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/transactions/trans-123/payments');
    });
  });

  describe('notifyPayment', () => {
    it('should notify payment for reservation', () => {
      httpSpy.patch.and.returnValue(of(mockPay));

      service.notifyPayment(
        'payment-123',
        'reservation',
        'res-123',
        'pref-456',
        PaymentType.ideal,
      ).subscribe(result => {
        expect(result).toEqual(mockPay);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/payments/payment-123',
        { preferenceId: 'pref-456', paymentType: PaymentType.ideal },
      );
    });

    it('should notify payment for transaction', () => {
      httpSpy.patch.and.returnValue(of(mockPay));

      service.notifyPayment(
        'payment-456',
        'transaction',
        'trans-789',
        'pref-999',
        PaymentType.ideal,
      ).subscribe(result => {
        expect(result).toEqual(mockPay);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/accounts/transactions/trans-789/payments/payment-456',
        { preferenceId: 'pref-999', paymentType: PaymentType.ideal },
      );
    });
  });

  describe('getKey private method behavior', () => {
    it('should use reservation URL for reservation path', () => {
      httpSpy.get.and.returnValue(of([]));

      service.getPaymentByResourceId('res-123', 'reservation').subscribe();

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123/payments');
    });

    it('should use transaction URL for transaction path', () => {
      httpSpy.get.and.returnValue(of([]));

      service.getPaymentByResourceId('trans-123', 'transaction').subscribe();

      expect(httpSpy.get).toHaveBeenCalledWith('v1/accounts/transactions/trans-123/payments');
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      const errorResponse = new Error('Network error');
      httpSpy.get.and.returnValue(throwError(() => errorResponse));

      service.getPayment('payment-123').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        },
      });
    });

    it('should handle payment creation errors', () => {
      const errorResponse = new Error('Payment failed');
      httpSpy.post.and.returnValue(throwError(() => errorResponse));

      service.createPaymentLinkByReservationId('res-123', mockReservationPayment).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined payment response', () => {
      httpSpy.get.and.returnValue(of(undefined));

      service.getPayment('non-existent').subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should handle null payment status in add method', () => {
      httpSpy.post.and.returnValue(of(mockPay));

      service.add('res-123', 'reservation', 'pending', null as any).subscribe();

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/reservations/res-123/payments/pending',
        null,
      );
    });
  });
});
