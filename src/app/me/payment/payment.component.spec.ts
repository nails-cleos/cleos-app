import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';
import { IPaymentAll } from '../../interfaces/payment';
import { PaymentState } from '../../store/reducers/payment.reducers';
import { cleanPayment } from '../../store/payment.actions';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  let storeSpy: jasmine.SpyObj<Store<PaymentState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  let paymentList$: Subject<any[]>;
  let response$: Subject<any>;
  let subErrors$: Subject<any[]>;

  beforeEach(async () => {
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
          return paymentList$.asObservable();
        case 2:
          return response$.asObservable();
        case 3:
          return subErrors$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [PaymentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    paymentList$.complete();
    response$.complete();
    subErrors$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when currentPath is emitted', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'reservation');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getPaymentByResourceId({ id: '123', path: 'reservation' }),
    );
  });

  it('should keep accountId from currentPath for back navigation', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'transaction');
    fixture.componentRef.setInput('accountId', 'account-1');
    fixture.detectChanges();

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'accounts', 'account-1', 'transactions', '123']);
  });

  it('should navigate back to the resource page when accountId is missing', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'reservation');
    fixture.detectChanges();

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'reservation', '123']);
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

  it('should clean and navigate when response has a path', () => {
    response$.next({ path: 'dashboard' });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(cleanPayment());
    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB/dashboard']);
  });

  it('should call store.dispatch(paymentSend) when pay() is called', () => {
    const payment: IPaymentAll = {
      timestamp: 0,
      amount: 0,
      description: '',
      paymentId: '',
      preferenceId: '',
      status: '',
      type: 'CASH',
      link: 'https://pay.com', id: 'p1',
    };

    component.pay(payment);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://pay.com' }));
  });

  it('should call store.dispatch(notifyPayment) when notify() is called', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'reservation');
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

  it('should return reservation currency icon', () => {
    const icon = component.getCurrency({
      id: 'p1',
      timestamp: 0,
      amount: 0,
      description: '',
      paymentId: '',
      preferenceId: '',
      status: '',
      type: 'CASH',
      reservation: { id: 'reservation-1', room: { currency: { icon: '$' } } } as any,
    });

    expect(icon).toBe('$');
  });

  it('should return transaction account currency icon', () => {
    const icon = component.getCurrency({
      id: 'p1',
      timestamp: 0,
      amount: 0,
      description: '',
      paymentId: '',
      preferenceId: '',
      status: '',
      type: 'CASH',
      transaction: { id: 'transaction-1', account: { currency: { icon: '£' } } } as any,
    });

    expect(icon).toBe('£');
  });

  it('should return euro when no reservation or transaction currency is available', () => {
    const icon = component.getCurrency({
      id: 'p1',
      timestamp: 0,
      amount: 0,
      description: '',
      paymentId: '',
      preferenceId: '',
      status: '',
      type: 'CASH',
    });

    expect(icon).toBe('euro');
  });

  it('should not navigate back when path or id is missing', () => {
    component.goBack();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('close() should hide error', () => {
    component.showError = true;
    component.close();
    expect(component.showError).toBeFalse();
  });
});
