import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCompleteComponent } from './payment-complete.component';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { paymentNotComplete } from '../../../store/actions/payment.actions';
import { PaymentState } from '../../../store/reducers/payment.reducers';

describe('PaymentCompleteComponent', () => {
  let fixture: ComponentFixture<PaymentCompleteComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  let paymentResultParams$: Subject<any>;
  let subErrors$: Subject<any>;
  let response$: Subject<any>;

  beforeEach(async () => {
    paymentResultParams$ = new Subject();
    subErrors$ = new Subject();
    response$ = new Subject();

    storeSpy = jasmine.createSpyObj<Store<PaymentState>>('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return paymentResultParams$.asObservable();
        case 2:
          return subErrors$.asObservable();
        case 3:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [PaymentCompleteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(PaymentCompleteComponent);
  });

  afterEach(() => {
    paymentResultParams$.complete();
    subErrors$.complete();
    response$.complete();
  });

  it('should dispatch incomplete payment for mollie params while callback parsing is disabled', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'pid',
      preferenceId: 'pref-1',
      payerId: null,
      token: null,
      reason: null,
      orderId: null,
      orderStatusId: null,
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentNotComplete({
      subError: [{ message: 'ME.PAYMENT.ERROR' }],
    }));
  });

  it('should dispatch incomplete payment for paypal params while callback parsing is disabled', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'transaction',
      status: 'approved',
      paymentId: 'payment-id',
      payerId: 'payer-1',
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentNotComplete({
      subError: [{ message: 'ME.PAYMENT.ERROR' }],
    }));
  });

  it('should dispatch incomplete payment for ideal params while callback parsing is disabled', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'payment-id',
      token: 'token-1',
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentNotComplete({
      subError: [{ message: 'ME.PAYMENT.ERROR' }],
    }));
  });

  it('should dispatch incomplete payment for paynl status callback while callback parsing is disabled', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'status',
      paymentId: 'payment-id',
      orderId: 'order-1',
      orderStatusId: '100',
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentNotComplete({
      subError: [{ message: 'ME.PAYMENT.ERROR' }],
    }));
  });

  it('should redirect to payment page when payment type is already resolved', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'created',
      paymentId: 'pid',
      paymentType: 'MOLLIE',
      accountId: 'account-1',
    });

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'reservation', '123', 'payment'], {
      queryParams: { accountId: 'account-1' },
    });
  });

  it('should dispatch incomplete payment when callback params are missing', () => {
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'pid',
    });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentNotComplete({
      subError: [{ message: 'ME.PAYMENT.ERROR' }],
    }));
  });

  it('should navigate back when subErrors exist', () => {
    // First emit valid params (required for path/id)
    paymentResultParams$.next({
      id: '123',
      path: 'reservation',
      status: 'approved',
      paymentId: 'pid',
      preferenceId: 'pref',
    });
    subErrors$.next([{ message: 'error' }]);

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith([
      'en-GB',
      'me',
      'reservation',
      '123',
      'payment',
    ]);
  });

  it('should navigate when response has path', () => {
    response$.next({ path: 'dashboard' });

    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB/dashboard']);
  });
});
