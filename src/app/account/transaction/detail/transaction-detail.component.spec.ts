import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TransactionDetailComponent } from './transaction-detail.component';
import { ITransaction } from '../../../interfaces/account';
import { getTransaction } from '../../../store/account.actions';
import { notifyPayment, paymentSend } from '../../../store/payment.actions';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let stateSubject: Subject<any>;

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

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.callFake((param: string) => {
          if (param === 'id') {
            return 'account-123';
          }
          if (param === 'transactionId') {
            return 'transaction-123';
          }
          return null;
        }),
      },
    },
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    const storeSpyObj = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    const translateSpyObj = jasmine.createSpyObj('TranslateService', ['instant'], {
      currentLang: 'en',
    });

    storeSpyObj.select.and.returnValue(stateSubject.asObservable());
    routerSpyObj.getCurrentNavigation.and.returnValue({
      extras: { state: { step: 2 } },
    });

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpyObj },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerSpyObj },
        { provide: TranslateService, useValue: translateSpyObj },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    stateSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with route parameters', () => {
    fixture.detectChanges();

    expect(component['id']).toBe('account-123');
    expect(component['transactionId']).toBe('transaction-123');
  });

  it('should set initial properties from constructor', () => {
    expect(component.dateFormat).toBe('en');
    expect(component.step).toBe(2);
    expect(component.language).toBe('en');
  });

  it('should dispatch GetTransaction action on init', () => {
    fixture.detectChanges();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      getTransaction({ id: 'account-123', transactionId: 'transaction-123' }),
    );
  });

  it('should update transaction when state has selected transaction', () => {
    fixture.detectChanges();

    const stateWithTransaction = {
      selected: mockTransaction,
    };

    stateSubject.next(stateWithTransaction);

    expect(component.transaction).toBeDefined();
    expect(component.transaction?.id).toBe('transaction-123');
    expect(component.transaction?.amount).toBe(100);
    expect(component.transaction?.date).toBeDefined();
  });

  it('should navigate to payment path when response has path', () => {
    fixture.detectChanges();

    const stateWithPath = {
      response: { path: 'some/path' },
    };

    stateSubject.next(stateWithPath);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en/some/path']);
  });

  it('should navigate to payment page when there are subErrors', () => {
    fixture.detectChanges();

    const stateWithErrors = {
      subErrors: [{ message: 'Payment failed' }],
    };

    stateSubject.next(stateWithErrors);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en', 'me', 'transaction', 'account-123', 'payment']);
  });

  it('should dispatch PaymentSend action when pay getter is called', () => {
    component.transaction = mockTransaction;

    void component.pay;

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      paymentSend({ link: 'https://payment.url' }),
    );
  });

  it('should dispatch NotifyPayment action when notify getter is called', () => {
    component.transaction = mockTransaction;

    void component.notify;

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      notifyPayment({
        id: 'payment-123',
        path: 'transaction',
        resourceId: 'transaction-123',
        preferenceId: 'preference-123',
        paymentType: 'card',
      }),
    );
  });

  it('should handle case when getCurrentNavigation returns null', () => {
    mockRouter.getCurrentNavigation.and.returnValue(null);

    const newComponent = new TransactionDetailComponent(
      mockStore as any,
      mockActivatedRoute as any,
      mockTranslateService,
      mockRouter,
    );

    expect(newComponent.step).toBeUndefined();
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges();
    spyOn(component['subscription']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
  });

  it('should handle empty state gracefully', () => {
    fixture.detectChanges();

    stateSubject.next({});

    expect(component.transaction).toBeUndefined();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle state with null selected transaction', () => {
    fixture.detectChanges();

    stateSubject.next({ selected: null });

    expect(component.transaction).toBeUndefined();
  });

  it('should handle notify when transaction has no payment', () => {
    component.transaction = { id: 'transaction-123' };

    expect(() => component.notify).toThrow();
  });
});
