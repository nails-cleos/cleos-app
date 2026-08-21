import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfoComponent } from './more-info.component';
import { of } from 'rxjs';
import { IReservationAll, ITracking } from '../../reservation';
import {
  DEFAULT_LOCALE,
  getCurrentTimeZone,
  getNowTimeZone,
} from '@app/util/dates';
import { IRoomAll } from '@app/room/room';
import { ICurrencyAll } from '@app/currency/currency';
import { IReview } from '@app/me/reservation/list/review';
import { addHours } from 'date-fns';
import { IPaymentAll } from '@app/interfaces/payment';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastService } from '@app/services/toast.service';
import { NavigationService } from '@app/services/navigation.service';
import { PaymentStore } from '@app/store/payment.store';
import { signal } from '@angular/core';
import { TrackingStore } from '@app/store/tracking.store';
import { ReservationStore } from '@app/store/reservation.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('MoreInfoComponent', () => {
  let component: MoreInfoComponent;
  let fixture: ComponentFixture<MoreInfoComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let reservationStoreSpy: {
    review: ReturnType<typeof signal>;
    loadReview: Mock;
    clean: Mock;
  };
  let trackingStoreSpy: {
    selected: ReturnType<typeof signal>;
    getByReservationId: Mock;
    executeByReservationId: Mock;
    updateByReservationId: Mock;
  };
  let paymentStoreSpy: {
    data: ReturnType<typeof signal>;
    recreate: Mock;
    getPaymentByResourceId: Mock;
    isLoading: Mock;
  };
  let clipboardSpy: Pick<Clipboard, 'copy'> & {
    copy: ReturnType<typeof vi.fn>;
  };

  let toastServiceSpy: {
    show: Mock;
  };
  let dialogSpy: Mock;

  const mockCurrency: ICurrencyAll = {
    id: 'currency-id',
    code: 'EUR',
    icon: 'euro',
    name: 'Euro',
  };

  const mockRoom = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    office: {},
    currency: mockCurrency,
    timeZone: getCurrentTimeZone(),
    paymentTypes: ['CASH'],
    primary: true,
  } as IRoomAll;

  const mockReservation = {
    id: 'reservation-1',
    room: mockRoom,
  } as IReservationAll;

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    reservationStoreSpy = {
      review: signal(undefined),
      loadReview: vi.fn().mockName('loadReview'),
      clean: vi.fn().mockName('clean'),
    };
    trackingStoreSpy = {
      selected: signal(undefined),
      getByReservationId: vi.fn().mockName('getByReservationId'),
      executeByReservationId: vi.fn().mockName('executeByReservationId'),
      updateByReservationId: vi.fn().mockName('updateByReservationId'),
    };
    paymentStoreSpy = {
      data: signal(undefined),
      recreate: vi.fn().mockName('recreate'),
      getPaymentByResourceId: vi.fn().mockName('getPaymentByResourceId'),
      isLoading: vi.fn().mockName('isLoading'),
    };

    clipboardSpy = {
      copy: vi.fn().mockName('Clipboard.copy'),
    };
    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };

    await TestBed.configureTestingModule({
      imports: [MoreInfoComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: TrackingStore, useValue: trackingStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: ReservationStore, useValue: reservationStoreSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(MoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogSpy = vi
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(undefined as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(reservationStoreSpy.loadReview).not.toHaveBeenCalled();
  });

  describe('should initialize signals', () => {
    it('should initialize reservationIdSignal', () => {
      const id = 'reservation-1';
      fixture.componentRef.setInput('id', id);
      fixture.detectChanges();

      expect(trackingStoreSpy.getByReservationId).toHaveBeenCalledWith(id);
      expect(paymentStoreSpy.getPaymentByResourceId).toHaveBeenCalledWith(
        id,
        'reservation',
      );
      expect(reservationStoreSpy.loadReview).toHaveBeenCalledWith(id);
    });
    it('should initialize paymentsSignal', () => {
      const payments = [
        { id: 'payment-1', reservation: mockReservation } as IPaymentAll,
      ];
      paymentStoreSpy.data.set({ payments, remainingAmount: 0 });
      fixture.detectChanges();

      expect(component.paymentList()).toBe(payments);
    });
    it('should initialize trackingSignal', () => {
      const tracking: ITracking = { reservation: mockReservation };
      trackingStoreSpy.selected.set(tracking);
      fixture.detectChanges();

      expect(component.trackingSignal()).toBe(tracking);
    });
    it('should initialize reviewSignal', () => {
      const review: IReview = { rating: 5, reservationId: mockReservation.id };
      reservationStoreSpy.review.set(review);
      fixture.detectChanges();

      expect(component.reviewSignal()).toBe(review);
    });
  });

  it('should return undefined when tracking is not complete', () => {
    const tracking: ITracking = {
      reservation: mockReservation,
      startedTimestamp: getNowTimeZone().getTime() / 1000,
    };
    trackingStoreSpy.selected.set(tracking);
    fixture.detectChanges();

    expect(component.totalTime()).toBeUndefined();
  });

  it('should return the total time when tracking is complete', () => {
    const now = getNowTimeZone();
    const tracking: ITracking = {
      reservation: mockReservation,
      startedTimestamp: addHours(now, -2).getTime() / 1000,
      completedTimestamp: now.getTime() / 1000,
    };
    trackingStoreSpy.selected.set(tracking);
    fixture.detectChanges();

    expect(component.totalTime()).toBe('02:00');
  });

  it('should call execute when reservationId is defined', () => {
    const id = 'reservation-1';
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();

    component.execute();

    expect(trackingStoreSpy.executeByReservationId).toHaveBeenCalledWith(id);
  });

  it('should not call execute when reservationId is not defined', () => {
    component.execute();
    expect(reservationStoreSpy.loadReview).not.toHaveBeenCalled();
  });

  it('should not call update when reservationId is not defined', () => {
    component.update();
    expect(reservationStoreSpy.loadReview).not.toHaveBeenCalled();
  });

  it('should call update when dialog is completed', () => {
    const id = 'reservation-1';
    const now = getNowTimeZone();
    const started = addHours(now, -2);
    const tracking: ITracking = {
      reservation: mockReservation,
      startedTimestamp: started.getTime() / 1000,
      completedTimestamp: now.getTime() / 1000,
    };

    fixture.componentRef.setInput('id', id);
    trackingStoreSpy.selected.set(tracking);

    fixture.detectChanges();

    dialogSpy.mockImplementation(() => {
      return {
        afterClosed: () =>
          of({ started: started.toISOString(), completed: now.toISOString() }),
      };
    });

    component.update();

    expect(trackingStoreSpy.updateByReservationId).toHaveBeenCalledWith(
      id,
      started.toISOString(),
      now.toISOString(),
    );
  });

  it('should call resend', () => {
    const payment = {
      id: 'payment-1',
      reservation: mockReservation,
      type: 'IDEAL',
    } as IPaymentAll;

    component.resend(payment);

    expect(paymentStoreSpy.recreate).toHaveBeenCalledWith(
      payment.id,
      payment.type,
    );
  });

  it('should not call copy when payment link is missing', () => {
    const payment = {
      id: 'payment-1',
      reservation: mockReservation,
      type: 'IDEAL',
    } as IPaymentAll;

    component.copy(payment);

    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(clipboardSpy.copy).not.toHaveBeenCalled();
  });

  it('should call copy', () => {
    const link = 'link';
    const payment = {
      id: 'payment-1',
      reservation: mockReservation,
      type: 'IDEAL',
      link,
    } as IPaymentAll;

    component.copy(payment);

    expect(toastServiceSpy.show).toHaveBeenCalledWith('PAYMENT.COPY', 'info');
    expect(clipboardSpy.copy).toHaveBeenCalledWith(link);
  });
});
