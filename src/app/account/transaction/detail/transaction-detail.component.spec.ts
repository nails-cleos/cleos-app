import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ITransaction } from '../../account';
import { notifyPayment, paymentSend } from '../../../store/actions/payment.actions';
import { NavigationService } from '../../../services/navigation.service';
import { AccountStore } from '../../../store/account.store';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '../../../util/dates';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let accountStoreSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<Router>;

  let selectedTransactionSignal: ReturnType<typeof signal<ITransaction | undefined>>;
  let response$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any[]>;

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
    selectedTransactionSignal = signal<ITransaction | undefined>(undefined);
    response$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any[]>([]);

    accountStoreSpy = jasmine.createSpyObj('AccountStore', ['clean', 'loadTransaction'], {
      selectedTransaction: selectedTransactionSignal.asReadonly(),
    });
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'currentNavigation']);

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    let callIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      callIndex++;
      switch (callIndex) {
        case 1:
          return response$.asObservable();
        case 2:
          return subErrors$.asObservable();
        default:
          return response$.asObservable();
      }
    });

    routerSpy.currentNavigation.and.returnValue({ extras: { state: { step: 2 } } } as any);

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AccountStore, useValue: accountStoreSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

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
    selectedTransactionSignal.set(mockTransaction);
    fixture.detectChanges();

    const transaction = component.transactionSignal();
    expect(transaction).toBeDefined();
    expect(transaction?.id).toBe('transaction-123');
    expect(transaction?.payment?.paymentURL).toBe('https://payment.url');
  });

  it('should dispatch paymentSend when pay() is called', () => {
    selectedTransactionSignal.set(mockTransaction);
    fixture.detectChanges();

    component.pay();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://payment.url' }));
  });

  it('should dispatch notifyPayment when notify() is called', () => {
    selectedTransactionSignal.set(mockTransaction);
    fixture.detectChanges();

    component.notify();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(notifyPayment({
      id: 'payment-123',
      path: 'transaction',
      resourceId: 'transaction-123',
      preferenceId: 'preference-123',
      paymentType: 'card',
    }));
  });

  it('should navigate when payment response emits a path', () => {
    response$.next({ path: 'some/path' });
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith([`${DEFAULT_LOCALE}/some/path`]);
  });

  it('should navigate to payment page when payment subErrors emit', () => {
    subErrors$.next([{ message: 'Payment failed' }]);
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'me', 'transaction', 'transaction-123', 'payment']);
  });

  it('should handle undefined selectedTransaction gracefully', () => {
    selectedTransactionSignal.set(undefined);
    fixture.detectChanges();

    expect(component.transactionSignal()).toBeUndefined();
  });
});
