import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ITransaction } from '../../account';
import { NavigationService } from '@app/services/navigation.service';
import { AccountStore } from '@app/store/account.store';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { PaymentStore } from '@app/store/payment.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let paymentStoreSpy: {
    response: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    notify: jasmine.Spy;
  };

  let accountStoreSpy: {
    selectedTransaction: ReturnType<typeof signal>;
    loadTransaction: jasmine.Spy;
    clean: jasmine.Spy;
  };

  const mockTransaction: ITransaction = {
    id: 'transaction-123',
    amount: 100,
    amountGifted: 10,
    payment: {
      id: 'payment-123',
      preferenceId: 'preference-123',
      type: 'card',
      paymentURL: 'https://payment.url',
      timestamp: 1672574400000,
    },
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    accountStoreSpy = {
      selectedTransaction: signal(undefined),
      loadTransaction: jasmine.createSpy('loadTransaction'),
      clean: jasmine.createSpy('clean'),
    };
    paymentStoreSpy = {
      response: signal(undefined),
      subErrors: signal(undefined),
      notify: jasmine.createSpy('notify'),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AccountStore, useValue: accountStoreSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'account-123');
    fixture.componentRef.setInput('transactionId', 'transaction-123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the transaction when accountId and transactionId signals emit', () => {
    expect(accountStoreSpy.clean).toHaveBeenCalled();
    expect(accountStoreSpy.loadTransaction).toHaveBeenCalledWith('account-123', 'transaction-123');
  });

  it('should update transactionSignal when selectedTransaction emits', () => {
    accountStoreSpy.selectedTransaction.set(mockTransaction);
    fixture.detectChanges();

    const transaction = component.transactionSignal();
    expect(transaction).toBeDefined();
    expect(transaction?.id).toBe('transaction-123');
    expect(transaction?.payment?.paymentURL).toBe('https://payment.url');
  });

  it('should dispatch notifyPayment when notify() is called', () => {
    accountStoreSpy.selectedTransaction.set(mockTransaction);
    fixture.detectChanges();

    component.notify();
    expect(paymentStoreSpy.notify)
      .toHaveBeenCalledWith('payment-123', 'transaction', 'transaction-123', 'preference-123', 'card');
  });

  it('should navigate when payment response emits a path', () => {
    paymentStoreSpy.response.set({ path: 'some/path' });
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['some/path']);
  });

  it('should navigate to payment page when payment subErrors emit', () => {
    paymentStoreSpy.subErrors.set([{ message: 'Payment failed' }]);
    fixture.detectChanges();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['me', 'transaction', 'transaction-123', 'payment']);
  });

  it('should handle undefined selectedTransaction gracefully', () => {
    accountStoreSpy.selectedTransaction.set(undefined);
    fixture.detectChanges();

    expect(component.transactionSignal()).toBeUndefined();
  });

  it('should open payment URL in same tab when pay is called', () => {
    const openSpy = spyOn(window, 'open');

    accountStoreSpy.selectedTransaction.set({
      payment: {
        paymentURL: 'https://pay.example.com/123',
      },
    } as any);

    component.pay();

    expect(openSpy).toHaveBeenCalledWith(
      'https://pay.example.com/123',
      '_self',
    );
  });
});
