import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ITransaction } from '../../../interfaces/account';
import { getTransaction } from '../../../store/actions/account.actions';
import { notifyPayment, paymentSend } from '../../../store/actions/payment.actions';
import { AccountState } from '../../../store/reducers/account.reducers';
import { NavigationService } from '../../../services/navigation.service';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;

  let storeSpy: jasmine.SpyObj<Store<AccountState>>;
  let routerSpy: jasmine.SpyObj<Router>;

  let translateService: TranslateService;

  let selectedTransaction$: BehaviorSubject<ITransaction | undefined>;
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
    selectedTransaction$ = new BehaviorSubject<ITransaction | undefined>(undefined);
    response$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any[]>([]);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'currentNavigation']);

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    let callIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      callIndex++;
      switch (callIndex) {
        case 1:
          return selectedTransaction$.asObservable();
        case 2:
          return response$.asObservable();
        case 3:
          return subErrors$.asObservable();
        default:
          return of(undefined);
      }
    });

    routerSpy.currentNavigation.and.returnValue({ extras: { state: { step: 2 } } } as any);

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'account-123');
    fixture.componentRef.setInput('transactionId', 'transaction-123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getTransaction when accountId and transactionId signals emit', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getTransaction({ id: 'account-123', transactionId: 'transaction-123' }),
    );
  });

  it('should update transactionSignal when selectedTransaction emits', () => {
    selectedTransaction$.next(mockTransaction);
    fixture.detectChanges();

    const transaction = component.transactionSignal();
    expect(transaction).toBeDefined();
    expect(transaction?.id).toBe('transaction-123');
    expect(transaction?.payment?.paymentURL).toBe('https://payment.url');
  });

  it('should dispatch paymentSend when pay() is called', () => {
    selectedTransaction$.next(mockTransaction);
    fixture.detectChanges();

    component.pay();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(paymentSend({ link: 'https://payment.url' }));
  });

  it('should dispatch notifyPayment when notify() is called', () => {
    selectedTransaction$.next(mockTransaction);
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

  it('should navigate when responseSignal emits a path', () => {
    response$.next({ path: 'some/path' });
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB/some/path']);
  });

  it('should navigate to payment page when subErrorsSignal emits', () => {
    subErrors$.next([{ message: 'Payment failed' }]);
    fixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'me', 'transaction', 'transaction-123', 'payment']);
  });

  it('should handle undefined selectedTransaction gracefully', () => {
    selectedTransaction$.next(undefined);
    fixture.detectChanges();

    expect(component.transactionSignal()).toBeUndefined();
  });
});
