import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';
import { IPaymentAll, PaymentType } from '../../interfaces/payment';
import { PaymentState } from '../../store/reducers/payment.reducers';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  let currentPath$: Subject<any>;
  let paymentList$: Subject<any[]>;
  let response$: Subject<any>;
  let subErrors$: Subject<any[]>;

  beforeEach(async () => {
    currentPath$ = new Subject();
    paymentList$ = new Subject();
    response$ = new Subject();
    subErrors$ = new Subject();

    storeSpy = jasmine.createSpyObj<Store<PaymentState>>('Store', ['dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return currentPath$.asObservable();
        case 2:
          return paymentList$.asObservable();
        case 3:
          return response$.asObservable();
        case 4:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [PaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    currentPath$.complete();
    paymentList$.complete();
    response$.complete();
    subErrors$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when currentPath is emitted', () => {
    currentPath$.next({ id: '123', path: 'reservation' });

    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPaymentByResourceId({ id: '123', path: 'reservation', redirect: true }),
    );
  });

  it('should hide footer when paymentList has items', () => {
    paymentList$.next([{ id: '1' }]);

    fixture.detectChanges();

    expect(component.hiddenSignal()).toBeTrue();
    expect(component.dataSourceSignal()).toEqual([{ id: '1' }]);
  });

  it('should show footer when paymentList is empty', () => {
    paymentList$.next([]);

    fixture.detectChanges();

    expect(component.hiddenSignal()).toBeFalse();
  });

  it('should set errorMessage and showError when subErrors are emitted', () => {
    subErrors$.next([{ message: 'Payment failed' }]);

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Payment failed');
    expect(component.showError).toBeTrue();
  });

  it('should call store.dispatch(paymentSend) when pay() is called', () => {
    const payment: IPaymentAll = {
      timestamp: 0,
      amount: 0,
      description: '',
      paymentId: '',
      preferenceId: '',
      status: '',
      type: PaymentType.cash,
      link: 'https://pay.com', id: 'p1',
    };

    component.pay(payment);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://pay.com' }));
  });

  it('should call store.dispatch(notifyPayment) when notify() is called', () => {
    currentPath$.next({ id: '123', path: 'reservation' });
    fixture.detectChanges();

    const payment: any = {
      id: 'p1',
      preferenceId: 'pref1',
      type: 'paypal',
    };

    component.notify(payment);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      notifyPayment({ id: 'p1', path: 'reservation', resourceId: '123', preferenceId: 'pref1', paymentType: 'paypal' }),
    );
  });

  it('close() should hide error', () => {
    component.showError = true;
    component.close();
    expect(component.showError).toBeFalse();
  });
});
