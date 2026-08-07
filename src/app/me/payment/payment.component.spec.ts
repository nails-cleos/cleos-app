import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { ActivatedRoute } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { PaymentStore } from '@app/store/payment.store';
import { signal } from '@angular/core';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let paymentStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    getPaymentByResourceId: jasmine.Spy;
    notify: jasmine.Spy;
    clean: jasmine.Spy;
    clearResponse: jasmine.Spy;
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    paymentStoreSpy = {
      data: signal(undefined),
      response: signal(undefined),
      subErrors: signal(undefined),
      isLoading: signal(false),
      getPaymentByResourceId: jasmine.createSpy('getPaymentByResourceId'),
      notify: jasmine.createSpy('notify'),
      clean: jasmine.createSpy('clean'),
      clearResponse: jasmine.createSpy('clearResponse'),
    };

    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getPaymentByResourceId when currentPath is emitted', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'reservation');
    fixture.detectChanges();

    expect(paymentStoreSpy.getPaymentByResourceId).toHaveBeenCalledWith('123', 'reservation');
  });

  it('should keep accountId from currentPath for back navigation', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'transaction');
    fixture.componentRef.setInput('accountId', 'account-1');
    fixture.detectChanges();

    component.goBack();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['accounts', 'account-1', 'transactions', '123']);
  });

  it('should navigate back to the resource page when accountId is missing', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.componentRef.setInput('path', 'reservation');
    fixture.detectChanges();

    component.goBack();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['reservation', '123']);
  });

  it('should hide footer when paymentList has items', () => {
    paymentStoreSpy.data.set({ remainingAmount: 0, payments: [{ id: '1' }] });

    fixture.detectChanges();

    expect(component.hiddenSignal()).toBeTrue();
    expect(component.dataSourceSignal()).toEqual([{ id: '1' } as any]);
  });

  it('should show footer when paymentList is empty', () => {
    paymentStoreSpy.data.set([]);

    fixture.detectChanges();

    expect(component.hiddenSignal()).toBeFalse();
  });

  it('should set errorMessage and showError when subErrors are emitted', () => {
    paymentStoreSpy.subErrors.set([{ message: 'Payment failed' }]);

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Payment failed');
    expect(component.showError).toBeTrue();
  });

  it('should clean and navigate when response has a path', () => {
    paymentStoreSpy.response.set({ path: 'dashboard' });
    fixture.detectChanges();

    expect(paymentStoreSpy.clean).toHaveBeenCalled();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard']);
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

    expect(paymentStoreSpy.notify).toHaveBeenCalledWith('p1', 'reservation', '123', 'pref1', 'paypal');
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

    expect(navigationServiceSpy.navigate).not.toHaveBeenCalled();
  });

  it('close() should hide error', () => {
    component.showError = true;
    component.close();
    expect(component.showError).toBeFalse();
  });

  it('should open payment URL in same tab when pay is called with paymentURL', () => {
    const openSpy = spyOn(window, 'open');

    const payment = { paymentURL: 'https://pay.example.com/123' } as any;

    component.pay(payment);

    expect(openSpy).toHaveBeenCalledWith(
      'https://pay.example.com/123',
      '_self',
    );
  });

  it('should open payment URL in same tab when pay is called with link', () => {
    const openSpy = spyOn(window, 'open');

    const payment = { link: 'https://pay.example.com/123' } as any;

    component.pay(payment);

    expect(openSpy).toHaveBeenCalledWith(
      'https://pay.example.com/123',
      '_self',
    );
  });
});
