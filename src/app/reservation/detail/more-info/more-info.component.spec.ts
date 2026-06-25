import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfoComponent } from './more-info.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { IReservationAll, ITracking } from '../../reservation';
import { DEFAULT_LOCALE, getCurrentTimeZone, getNowTimeZone } from '../../../util/dates';
import { IRoomAll } from '../../../room/room';
import { ICurrencyAll } from '../../../currency/currency';
import { IReview } from '../../../me/reservation/list/review';
import { addHours } from 'date-fns';
import {
  executeTrackingByReservationId,
  getReview,
  getTrackingByReservationId,
  reservationFindPayments,
  updateTrackingByReservationId,
} from '../../../store/actions/reservation.actions';
import { IPaymentAll } from '../../../interfaces/payment';
import { recreate } from '../../../store/actions/payment.actions';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastService } from '../../../services/toast.service';
import { NavigationService } from '../../../services/navigation.service';

describe('MoreInfoComponent', () => {
  let component: MoreInfoComponent;
  let fixture: ComponentFixture<MoreInfoComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let payments$: BehaviorSubject<any>;
  let tracking$: BehaviorSubject<any>;
  let review$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let dialogSpy: jasmine.Spy<any>;

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
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    payments$ = new BehaviorSubject<any>(undefined);
    tracking$ = new BehaviorSubject<any>(undefined);
    review$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return payments$.asObservable();
        case 2:
          return tracking$.asObservable();
        case 3:
          return review$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [MoreInfoComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  afterEach(() => {
    payments$.complete();
    tracking$.complete();
    review$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  describe('should initialize signals', () => {
    it('should initialize reservationIdSignal', () => {
      const id = 'reservation-1';
      fixture.componentRef.setInput('id', id);
      fixture.detectChanges();

      expect(storeSpy.dispatch).toHaveBeenCalledWith(getTrackingByReservationId({ id }));
      expect(storeSpy.dispatch).toHaveBeenCalledWith(reservationFindPayments({ id }));
      expect(storeSpy.dispatch).toHaveBeenCalledWith(getReview({ id }));
    });
    it('should initialize paymentsSignal', () => {
      const payments = [{ id: 'payment-1', reservation: mockReservation } as IPaymentAll];
      payments$.next(payments);
      fixture.detectChanges();

      expect(component.paymentsSignal()).toBe(payments);
    });
    it('should initialize trackingSignal', () => {
      const tracking: ITracking = { reservation: mockReservation };
      tracking$.next(tracking);
      fixture.detectChanges();

      expect(component.trackingSignal()).toBe(tracking);
    });
    it('should initialize reviewSignal', () => {
      const review: IReview = { rating: 5, reservationId: mockReservation.id };
      review$.next(review);
      fixture.detectChanges();

      expect(component.reviewSignal()).toBe(review);
    });
  });

  it('should return undefined when tracking is not complete', () => {
    const tracking: ITracking = { reservation: mockReservation, startedTimestamp: getNowTimeZone().getTime() / 1000 };
    tracking$.next(tracking);
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
    tracking$.next(tracking);
    fixture.detectChanges();

    expect(component.totalTime()).toBe('02:00');
  });

  it('should call execute when reservationId is defined', () => {
    const id = 'reservation-1';
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();

    component.execute();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(executeTrackingByReservationId({ id }));
  });

  it('should not call execute when reservationId is not defined', () => {
    component.execute();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should not call update when reservationId is not defined', () => {
    component.update();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
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
    tracking$.next(tracking);

    fixture.detectChanges();

    dialogSpy.and.callFake(() => {
      return {
        afterClosed: () => of({ started: started.toISOString(), completed: now.toISOString() }),
      };
    });

    component.update();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(updateTrackingByReservationId(
      { id, started: started.toISOString(), completed: now.toISOString() }),
    );
  });

  it('should call resend', () => {
    const payment = { id: 'payment-1', reservation: mockReservation, type: 'IDEAL' } as IPaymentAll;

    component.resend(payment);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(recreate({ id: payment.id, paymentType: payment.type }));
  });

  it('should not call copy when payment link is missing', () => {
    const payment = { id: 'payment-1', reservation: mockReservation, type: 'IDEAL' } as IPaymentAll;

    component.copy(payment);

    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(clipboardSpy.copy).not.toHaveBeenCalled();
  });

  it('should call copy', () => {
    const link = 'link';
    const payment = { id: 'payment-1', reservation: mockReservation, type: 'IDEAL', link } as IPaymentAll;

    component.copy(payment);

    expect(toastServiceSpy.show).toHaveBeenCalledWith('PAYMENT.COPY', 'info');
    expect(clipboardSpy.copy).toHaveBeenCalledWith(link);
  });
});
